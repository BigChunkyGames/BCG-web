const code = `using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using UnityEditor;

public class ProceduralGeneration : MonoBehaviour
{
    public int width, height; // initial spawn area. height is current height of stack of blocks
    private int startHeight; // how tall the first top col is. random each time
    public int min_height_range, max_height_range; // how much the next height changes by
    public float decrease_height_chance = 0.2f; // percent chance height will --
    public int min_stone_height_range, max_stone_height_range;
    public GameObject particlePrefab; // default block explode particle not used if block has one in its child
    public GameObject aquireEffectPrefab; // default block explode particle not used if block has one in its child
    private float spawnDistanceX = 20 ; // how far away from player blocks start to spawn on X axis
    private float spawnDistanceY = 20 ; // how far away from player blocks start to spawn on Y axis
    private float spawnDistanceYtoXRatio = 0.5625f; // ratio of y spawn distance to x ie 1080/1920
    public int chunkSize; // max x and y size of a chunk
    public int rowsToSpawn; // how many underground rows we're spawning at a time

    public int minCloudHeight = 20; // distance from ground
    public float cloudSpawnChance = 0.08f; // percent chance to spawn cloud

    public int flatAreaStart = 10; // how far away from 0 the flat area starts
    public int flatAreaWidth = 10; // how long the flat area lasts
    public float treeSpawnChance = 0.1f; // percent chance to spawn tree

    [Header("Background paralax")]
    public GameObject backgroundPrefab; // prefab
    public int widthOfBackground;
    public int backgroundsToHaveAtOnce = 3;
    public int spawnProximity; // spawn background when player is this far away from next background spawn location
    private int timesSpawned = 0; // first background is already spawned
    private List<GameObject> backgrounds;
    private GameObject lastBackgroundSpawned;

    private Dictionary<int, int> columnsSpawnedPerRow; // how many columns have been spawned in each row of chunks
    private Dictionary<Block.type, GameObject> blockPrefabs; // to get from blocktype to prefab
    private int topOfGroundY = 0; // where the grass block is 
    private int playerLastPosX = -1;
    private int playerLastPosY = -1;
    private bool stoppedSpawningTopChunks = false;

    private Transform player;
    private Rigidbody playerRB;
    private Player playerScript;
    private GameObject[] clouds;
    private GameObject[] trees;
    private AudioManager audioManager;
    private FollowPlayer cameraScript;
    private BlockInteractions blockInteractions;

    [HideInInspector] public Dictionary<Block.type, int> destroyedBlocks;
    // timing
    System.Diagnostics.Stopwatch updateWatch;
    System.Diagnostics.Stopwatch columnWatch;
    System.Diagnostics.Stopwatch rowWatch;

    void Awake(){
        GameManager.Instance.RegisterType(this);
    }
    
    void Start(){
        audioManager = GameManager.Instance.GetType<AudioManager>();
        cameraScript = GameManager.Instance.GetType<FollowPlayer>();
        cameraScript = GameManager.Instance.GetType<FollowPlayer>();
        blockInteractions = gameObject.GetComponent<BlockInteractions>();
        clouds = Resources.LoadAll<GameObject>("Prefabs/Blocks/Clouds");
        trees = Resources.LoadAll<GameObject>("Prefabs/Trees");
        backgrounds = new List<GameObject>();
        SpawnBackground();
        // get prefabs from folder
        blockPrefabs = new Dictionary<Block.type, GameObject>();
        UnityEngine.Object[] blockObjects = Resources.LoadAll("Prefabs/Blocks", typeof(GameObject));
        foreach (GameObject item in blockObjects)
        {
            Block block = item.GetComponent<Block>();
            if (block != null){
                if(!blockPrefabs.ContainsKey(block.blockType))
                {
                    blockPrefabs.Add(block.blockType, item);
                }
        }}   
        player = GameObject.FindGameObjectWithTag("Player").transform;
        playerRB = player.GetComponent<Rigidbody>();
        playerScript = player.GetComponent<Player>();
        destroyedBlocks = new Dictionary<Block.type, int>();
        columnsSpawnedPerRow = new Dictionary<int, int>(); // row, x value of next column to spawn
        columnsSpawnedPerRow[0] = 0;
        playerLastPosX = (int)player.position.x;
        playerLastPosY = (int)player.position.y;
        startHeight = height;
        for (int i = 0; i < width; i++)
        {
            GenerateTopColumn();
        }
        updateWatch = new System.Diagnostics.Stopwatch();
        columnWatch = new System.Diagnostics.Stopwatch();
        rowWatch = new System.Diagnostics.Stopwatch();
    }

    int highestVisibleRow = 0; // the highest row (going downwards that should be spawning underground terrain)
    int currentRowDepth;
    private void Update() {
        // updateWatch.Start();
        // if player has moved 1 unit in either direction
        if((int)player.position.x != playerLastPosX || (int)player.position.y != playerLastPosY) {
            spawnDistanceX = cameraScript.spawnDistance;
            spawnDistanceY = spawnDistanceX * spawnDistanceYtoXRatio ; 
            // spawn clouds if above surface
            if(player.position.y > topOfGroundY + minCloudHeight){
                if(Random.value < cloudSpawnChance){
                    SpawnCloud();
                }
            }
            // if its time to spawn more background
            if(player.position.x > timesSpawned * widthOfBackground - spawnProximity){
                SpawnBackground();
            }
            
            highestVisibleRow = GetHighestVisibleRow();
        }

        GenerateTopChunk();
        
        if(highestVisibleRow > 0){
            for (int i = highestVisibleRow; i <= rowsToSpawn + highestVisibleRow; i++)
            {
                if(!columnsSpawnedPerRow.ContainsKey(i)) columnsSpawnedPerRow.Add(i, 0);
                // if row hasn't spawned columns as far as player can see, spawn more
                while(columnsSpawnedPerRow[i] < (int)player.position.x + spawnDistanceX)
                {
                    GenerateDeepChunk((int)player.position.x - (int)spawnDistanceX, i);
                }
                // if row will not be visible, dont spawn it yet
                if(player.position.y - spawnDistanceY >= -startHeight - i * chunkSize){
                    break;
                }
            }
        }
        
        // DestroyOldPieces(player.position.x);
        playerLastPosX = (int)player.position.x;
        playerLastPosY = (int)player.position.y;
        // PrintTimeElapsed(updateWatch);
        
    }

    // also restarts the watch
    void PrintTimeElapsed(System.Diagnostics.Stopwatch watch) {
        System.TimeSpan ts = watch.Elapsed;
        string elapsedTime = System.String.Format("{0:00}:{1:00}:{2:00}.{3:00}",
            ts.Hours, ts.Minutes, ts.Seconds,
            ts.Milliseconds / 10);
        Debug.Log(elapsedTime);
        updateWatch.Reset();
    }


    // spawns chunks until they fill screen if player is going to see them
    void GenerateTopChunk(){
        // if player can see above startHeight, keep spawning top chunks
        if(player.position.x > columnsSpawnedPerRow[0] - spawnDistanceX && player.position.y > -startHeight-spawnDistanceY) {
            for (int i = 0; i < chunkSize; i++)
            {
                GenerateTopColumn();
            }
            GenerateTopChunk();
        } else {
            stoppedSpawningTopChunks = true;
        }
        
    }


    void GenerateDeepChunk(int chunkX, int row){
        // chunkX is x value of leftmost part of chunk
        int startX = columnsSpawnedPerRow[row];
        if(chunkX > startX) startX = chunkX; // allow skipping columns that wont be on screen
        int startY = -startHeight - 1 - chunkSize * (row-1); 
        // how to decide what block to spawn
        // attempt 1: spawn based on what is up or left
        
        // the gameobjects in the current chunk in the order they spawned
        GameObject[] chunk = new GameObject[chunkSize * chunkSize];
        int i = 0;
        GameObject blockToSpawn = null;
        GameObject aboveBlock = null;
        GameObject leftBlock = null;
        for (int x = startX; x < chunkSize + startX; x++)
        {
            // useAbove choose which block to use per row TODO per row?
            for (int y = startY; y >= startY-chunkSize + 1; y--)
            {
                // if on top of chunk get block above
                if(y == startY){
                    aboveBlock = GetAdjacentBlock(startX, startY, false);
                } else {
                    // else we know what block is above
                    aboveBlock = chunk[i-1];
                }
                if(x == startX){
                    leftBlock = GetAdjacentBlock(startX, startY, true);
                } else {
                    leftBlock = chunk[i-chunkSize];
                }
                blockToSpawn = GetBlockToSpawn(leftBlock.GetComponent<Block>().blockType, aboveBlock.GetComponent<Block>().blockType, y);
                chunk[i] = Spawn(blockToSpawn, x, y);
                if(blockToSpawn.GetComponent<Block>().blockType == Block.type.empty){
                    // just create background
                    Vector3 pos = new Vector3(x,y,0);
                    CreateBackground(Block.type.stone, pos);
                }
                i++;
            }
        }
        columnsSpawnedPerRow[row] = startX + chunkSize;
    }

    // if not left than up
    private GameObject GetAdjacentBlock(int startX, int startY, bool left=false){
        int yOffset = 1;
        int xOffset = 0;
        if(left){
            yOffset = 0;
            xOffset = -1;
        }
        Vector3 spotToCheck = new Vector3(startX + xOffset, startY+yOffset, 0);
        Collider[] hitColliders = Physics.OverlapSphere(spotToCheck, 0.1f);
        // cleverly avoid accidently hitting the wall of death
        if(hitColliders.Length == 0){ return blockPrefabs[Block.type.stone]; }
        if(hitColliders[0].transform.tag == "Block") return hitColliders[0].gameObject;
        if(hitColliders.Length != 2){ return blockPrefabs[Block.type.stone]; }
        if(hitColliders[1].transform.tag == "Block") return hitColliders[1].gameObject;
        return blockPrefabs[Block.type.stone];
        
    }

    private GameObject GetBlockToSpawn(Block.type leftBlock, Block.type aboveBlock, int depth){
        // given a block that is above or to the left

        // in case block hasn't been implemented yet, use sstone
        try{
            Dictionary<Block.type, float> test = blockInteractions.interactions[leftBlock];
        } catch {
            leftBlock = Block.type.stone;
        }
        try{
            Dictionary<Block.type, float> test = blockInteractions.interactions[aboveBlock];
        } catch {
            aboveBlock = Block.type.stone;
        }

        // combine weight of both possibilities
        float maxWeight = blockInteractions.totalWeights[leftBlock] + blockInteractions.totalWeights[aboveBlock];
        float rate = Random.Range(0, maxWeight);
        float sum = 0f;
        depth += 0;
        float minDepthScalar = 3;
        
        foreach (KeyValuePair<Block.type, float> entry in blockInteractions.interactions[leftBlock])
        {
            sum += entry.Value;
            if(rate <= sum){
                // don't spawn it if too high up
                if(depth < blockInteractions.blockMinDepths[entry.Key] * minDepthScalar){
                    return blockPrefabs[entry.Key];
                }
                // spawn stone if its not deep enough to spawn what we got
                return blockPrefabs[Block.type.stone];
            } 
        }
        foreach (KeyValuePair<Block.type, float> entry in blockInteractions.interactions[aboveBlock])
        {
            sum += entry.Value;
            if(rate <= sum){
                if(depth < blockInteractions.blockMinDepths[entry.Key] * minDepthScalar){
                    return blockPrefabs[entry.Key];
                }
                // spawn stone if its not deep enough to spawn what we got
                return blockPrefabs[Block.type.stone];
            } 
        }

        
        
        Debug.LogWarning("block to spawn wasn't found");
        return blockPrefabs[Block.type.stone];
    }

    private int GetHighestVisibleRow(){
        // TODO make more efficient
        // get highest visible underground row
        for (int i = 0; i < 999; i++)
        {
            if(player.position.y - spawnDistanceY < -startHeight){
                // can see below top row
                if(player.position.y + spawnDistanceY < -startHeight){
                    // we can no longer see top row, so get highest 
                    // if top of visible area is lower than startheight - chunks
                    if(player.position.y + spawnDistanceY <= -startHeight - chunkSize * i){
                        continue;
                    } else {
                        return i;
                    }
                } else {
                    // we can still see top row, so row 1 will be highest
                    return 1;
                }
            } else {
                // we can't see below top row, so top row is highest
                return 0;
            }
        }
        Debug.LogWarning("This should never happen!!!!!!!!!!!!!!");
        return 0;
    }

    bool flatTime = false;
    bool justSpawnedTree = false;
    void GenerateTopColumn()
    {
        // if creating flat area
        if(columnsSpawnedPerRow[0] >= flatAreaStart && columnsSpawnedPerRow[0] < flatAreaStart + flatAreaWidth){
            height = startHeight;
            topOfGroundY = 0;
            flatTime = true;
        } else {
            int min_height = height - min_height_range;
            int max_height = height + max_height_range;
            if(min_height <= 0) min_height = 1;
            height = Random.Range(min_height,max_height); // how tall this stack of blocks is
            // 1/3 chance of decreasing height
            if(Random.Range(0f, 1f) <= decrease_height_chance){ height--; }
            topOfGroundY = height-startHeight; // where the grass block is 
            flatTime = false;
        }
        
        int min_stone_height = height - min_stone_height_range;
        int max_stone_height = height + max_stone_height_range;
        int stone_height = Random.Range(min_stone_height,max_stone_height);

        // allow skipping columns that are behind player
        if(player.position.x - spawnDistanceX > columnsSpawnedPerRow[0] && stoppedSpawningTopChunks){
            columnsSpawnedPerRow[0] = (int)player.position.x - (int)spawnDistanceX - 1;
            stoppedSpawningTopChunks = false;
        }
        for (int y = 0; y < height; y++)
        {
            if(y<stone_height){
                Spawn(blockPrefabs[Block.type.stone], columnsSpawnedPerRow[0], y-startHeight);
            } else {
                Spawn(blockPrefabs[Block.type.dirt], columnsSpawnedPerRow[0], y-startHeight);
            }
        }
        // spawn grass
        if(height == stone_height){ // allow spawning stone instead of grass
            Spawn(blockPrefabs[Block.type.stone], columnsSpawnedPerRow[0], topOfGroundY);
        } else {
            Spawn(blockPrefabs[Block.type.grass], columnsSpawnedPerRow[0], topOfGroundY);
            // spawn plants
            if(Random.value < treeSpawnChance && !flatTime && !justSpawnedTree){
                GameObject tree = trees[Random.Range(0,trees.Length)];
                Spawn(tree, columnsSpawnedPerRow[0], (float)topOfGroundY+0.25f); 
                justSpawnedTree = true;
            } else {
                justSpawnedTree = false;
            }
        }
        columnsSpawnedPerRow[0]++;
    }

    void SpawnCloud(){
        
        // // if player is high enough, spawn clouds at a random point around a half-circle determined by player direction of movement
        float radians;
        float angle = Mathf.Atan2(playerRB.velocity.y, playerRB.velocity.x) * Mathf.Rad2Deg;
        if(player.position.y > topOfGroundY + minCloudHeight+spawnDistanceY){
            radians = Random.Range(angle+90,angle-90) * Mathf.PI/180f;
        } else { // else (if player is near the ground), spawn clouds at a random angle between right and up
            radians = Random.Range(0,90) * Mathf.PI/180f;
        }
        // spawn clouds at a random angle always spawnDistance away from player
        int cloudX = (int)(Mathf.Cos(radians) * spawnDistanceX + player.position.x);
        int cloudY = (int)(Mathf.Sin(radians) * spawnDistanceY + player.position.y);
        if(cloudY > topOfGroundY){
            Spawn(clouds[Random.Range(0,clouds.Length)], cloudX, cloudY);
            return;
        }
        Debug.LogWarning("Would have spawned a cloud in the ground");
    }

    GameObject Spawn(GameObject block, float width, float height){
        // spawn with flipped rotation 
        GameObject new_block = Instantiate(block, new Vector3(width,height,0), Quaternion.Euler(0, -180, 0));
        new_block.transform.parent = transform;
        // 
        return new_block;
    }

    public void CreateBackground(Block.type blockType, Vector3 pos){
        // create stone for empty
        if(blockType == Block.type.empty || blockType == Block.type.tnt) blockType = Block.type.stone;
        GameObject new_block_background = Instantiate(blockPrefabs[blockType], new Vector3(pos.x,pos.y,1), Quaternion.identity);
        // new_block_background.transform.parent = transform;
        Renderer r = new_block_background.GetComponent<Renderer>();
        r.material.color = new Color(r.material.color.r - .3f,r.material.color.g - .4f,r.material.color.b - .3f,1);
        new_block_background.transform.parent = transform;
    } 

    // called on player coliision
    public void DestroyBlock(GameObject block, bool particleFromPlayer = true){
    // create background if its not destructable
        Block.type blockType = block.GetComponent<Block>().blockType;
        if(blockType == Block.type.empty) return;
        
        if(block.transform.tag != "Destructable"){ CreateBackground(blockType, block.transform.position);}

        // add block to dictionary
        if (!destroyedBlocks.ContainsKey(blockType)){ 
            destroyedBlocks.Add(blockType, 1);
            // print("new type of block destroyed");
        }else{
            destroyedBlocks[blockType]++;
        }
        audioManager.PlaySound(blockType.ToString());
        SpawnParticles(block);
        StartCoroutine(AquireEffect(block.transform.position, block.GetComponent<Block>().value, particleFromPlayer));
        Destroy(block);
        if(blockType == Block.type.tnt){
            if(block.GetComponent<Block>().exploded == false){
                block.GetComponent<Block>().exploded = true;
                playerScript.Explode(true, block.transform.position);
                print("boom!");
            }
            
        }
    }

    void SpawnParticles(GameObject block){
        // trees have particles as children
        ParticleSystem childParticles = block.GetComponentInChildren(typeof(ParticleSystem), true) as ParticleSystem;
        GameObject particles;
        ParticleSystem.MainModule settings;
        if (childParticles != null)
        {
            Debug.Log("Spawning particles from tree");
            childParticles.gameObject.SetActive(true);
            particles = Instantiate(childParticles.gameObject, block.transform.position, Quaternion.identity);
            settings = particles.GetComponent<ParticleSystem>().main;
        }
        else
        {
            particles = Instantiate(particlePrefab, block.transform.position, Quaternion.identity);
            settings = particles.GetComponent<ParticleSystem>().main;
            settings.startColor = block.GetComponent<Renderer>().material.color ;
        }
        Destroy(particles, settings.duration);
    }

    // parallax
    private void SpawnBackground(){
        Vector3 location = new Vector3(widthOfBackground * timesSpawned, 0, 0);
        lastBackgroundSpawned = Instantiate(backgroundPrefab, location, Quaternion.identity);
        if(backgrounds.Count >= backgroundsToHaveAtOnce){
            Destroy(backgrounds[0]);
            backgrounds.RemoveAt(0);
        }
        backgrounds.Add(lastBackgroundSpawned);
        timesSpawned++;
    }

    public IEnumerator AquireEffect(Vector3 blockPos, int value, bool fromPlayer = true){
        // make it look like points are flying into player
        Vector3 plusZ = new Vector3(0,0,-1);
        blockPos+=plusZ; // make effect in front of blocks
        GameObject line = Instantiate(aquireEffectPrefab, blockPos, Quaternion.identity);
        // make bigger depending on value
        line.GetComponent<TrailRenderer>().widthMultiplier = 0.15f + (value-1) * 0.01f;
        float endTime = .5f;
        float t=0;
        // first, go to a random location on a circle around the block
        Vector3 randomLocation = blockPos;
        // particles fly out farther if moving faster
        float radius = playerRB.velocity.magnitude / 5f;
        var pointOnCircle = Random.insideUnitCircle.normalized * radius;
        randomLocation.x += pointOnCircle.x;
        randomLocation.y += pointOnCircle.y;
        Vector3 pointToLerpTowards; // by lerping to a point thats lerping, we can get smoother lerping
        Vector3 startPos = blockPos+plusZ;
        if(fromPlayer){startPos = player.transform.position+plusZ;}
        while(t < endTime){
            t += Time.deltaTime;
            pointToLerpTowards = Vector3.Lerp(randomLocation, player.transform.position+plusZ, t/endTime);
            line.transform.position = Vector3.Lerp(startPos, pointToLerpTowards, Mathf.MoveTowards (0f, 1f, Mathf.Pow(2*t, 2f)));
            yield return new WaitForEndOfFrame();
        }
        audioManager.PlaySound("coin");
        yield return new WaitForSeconds(0.02f);
        Destroy(line);
        yield return null;
    }

    void DestroyOldPieces(float playerXPosition){
        int c = 0;
        foreach(Transform child in transform){
            c++;
            if(child.position.x < playerXPosition - spawnDistanceX){
                Destroy(child.gameObject);
            } else {
                // print("Iterated " + c + " times");
                if(c>150){
                    Debug.LogWarning("Too many iterations");
                }
                return;
            }
        }
    }
}
    `
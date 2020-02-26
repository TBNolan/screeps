// Screeps code v0.2.1

/** TODO
 * 1. Optimize creepParts variables; leftover energy being unused due to fractions in Part Calculations
 */

var roleHarvester = require('role.Harvester');
var roleUpgrader = require('role.Upgrader');
var roleBuilder = require('role.Builder');
var roleRepairer = require('role.Repairer');
var roleHauler = require('role.Hauler');
var roleMiner = require('role.Miner');
var roleLongDistanceHarvester = require('role.LongDistanceHarvester')
require('role.towers');
require('prototype.spawn');


//******* Globals **********/
// Initial Squad numbers (change after controller lvl 3, see below)
var num_harvesters = 0;
var num_upgraders = 2;
var num_builders = 2;
var num_repairers = 2;
var num_haulers = 2;
var enableLongDistanceHarvesters = false;
const HOME = 'E47N32';
const LD_NODES = [
    //fill array with ['<roomID>', <node_index>] of applicable rooms
    ['E48N32', 0]
];

/**
 * BODYPART_COST
    "move": 50
    "work": 100
    "attack": 80
    "carry": 50
    "heal": 250
    "ranged_attack": 150
    "tough": 10
    "claim": 600
},
*/
//Calculate parts for workers
var mainSpawnEnergyCap = Game.spawns.Spawn1.room.energyCapacityAvailable;


//Global build for Miners. They do not scale with Spawn Energy Cap. Requires min 550 energy
//Efficient mining is 5 WORK parts per node.
//Notice no carry parts as Miners will drop resources onto the ground
var minerBuild = [WORK, WORK, WORK, WORK, WORK, MOVE];

var builderBuild, upgraderBuild, repairerBuild, haulerBuild;
//******* End Globals *******//

//Get random names for Screeps
var names1 = ["Jackson", "Aiden", "Liam", "Lucas", "Noah", "Mason", "Jayden", "Ethan", "Jacob", "Jack", "Caden", "Logan", "Benjamin", "Michael", "Caleb", "Ryan", "Alexander", "Elijah", "James", "William", "Oliver", "Connor", "Matthew", "Daniel", "Luke", "Brayden", "Jayce", "Henry", "Carter", "Dylan", "Gabriel", "Joshua", "Nicholas", "Isaac", "Owen", "Nathan", "Grayson", "Eli", "Landon", "Andrew", "Max", "Samuel", "Gavin", "Wyatt", "Christian", "Hunter", "Cameron", "Evan", "Charlie", "David", "Sebastian", "Joseph", "Dominic", "Anthony", "Colton", "John", "Tyler", "Zachary", "Thomas", "Julian", "Levi", "Adam", "Isaiah", "Alex", "Aaron", "Parker", "Cooper", "Miles", "Chase", "Muhammad", "Christopher", "Blake", "Austin", "Jordan", "Leo", "Jonathan", "Adrian", "Colin", "Hudson", "Ian", "Xavier", "Camden", "Tristan", "Carson", "Jason", "Nolan", "Riley", "Lincoln", "Brody", "Bentley", "Nathaniel", "Josiah", "Declan", "Jake", "Asher", "Jeremiah", "Cole", "Mateo", "Micah", "Elliot"]
var names2 = ["Sophia", "Emma", "Olivia", "Isabella", "Mia", "Ava", "Lily", "Zoe", "Emily", "Chloe", "Layla", "Madison", "Madelyn", "Abigail", "Aubrey", "Charlotte", "Amelia", "Ella", "Kaylee", "Avery", "Aaliyah", "Hailey", "Hannah", "Addison", "Riley", "Harper", "Aria", "Arianna", "Mackenzie", "Lila", "Evelyn", "Adalyn", "Grace", "Brooklyn", "Ellie", "Anna", "Kaitlyn", "Isabelle", "Sophie", "Scarlett", "Natalie", "Leah", "Sarah", "Nora", "Mila", "Elizabeth", "Lillian", "Kylie", "Audrey", "Lucy", "Maya", "Annabelle", "Makayla", "Gabriella", "Elena", "Victoria", "Claire", "Savannah", "Peyton", "Maria", "Alaina", "Kennedy", "Stella", "Liliana", "Allison", "Samantha", "Keira", "Alyssa", "Reagan", "Molly", "Alexandra", "Violet", "Charlie", "Julia", "Sadie", "Ruby", "Eva", "Alice", "Eliana", "Taylor", "Callie", "Penelope", "Camilla", "Bailey", "Kaelyn", "Alexis", "Kayla", "Katherine", "Sydney", "Lauren", "Jasmine", "London", "Bella", "Adeline", "Caroline", "Vivian", "Juliana", "Gianna", "Skyler", "Jordyn"]

var getRandomName = (prefix) => {
    var name, isNameTaken, tries = 0;
    do {
        var nameArray = Math.random() > .5 ? names1 : names2;
        name = nameArray[Math.floor(Math.random() * nameArray.length)];

        if (tries > 3){
            name += nameArray[Math.floor(Math.random() * nameArray.length)];
        }

        tries++;
        isNameTaken = Game.creeps[name] !== undefined;
    } while (isNameTaken);

    return prefix+" "+name;
}


module.exports.loop = function () {
    //Clear dead creeps from memory
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    function getUnnocupiedLongDistanceNodesID() {
        let otherLongDistanceHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'longDistanceHarvester');
        for (var i = 0; i < LD_NODES.length; i++) {
            let thisSourceHasAMiner = false;
            for (var j = 0; j < otherLongDistanceHarvesters.length; j++) {
                if (otherLongDistanceHarvesters[j].memory.target == LD_NODES[i][0] && otherLongDistanceHarvesters[j].memory.sourceIndex == LD_NODES[i][1]) {
                    thisSourceHasAMiner = true;
                }
            }
            if (!thisSourceHasAMiner) {
                return i;
            }
        }
        return null;
    }

    //Count our creeps
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.ticksToLive > 50);
    var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler');
    var longDistanceHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'longDistanceHarvester');
    var energyNeeded;

    if (mainSpawnEnergyCap < 550) {
        //Level 1 controller 300 energy
        energyNeeded = 300;
        builderBuild = [MOVE, MOVE, WORK, CARRY, CARRY];
        upgraderBuild = [MOVE, MOVE, WORK, CARRY, CARRY];
        repairerBuild = [MOVE, MOVE, WORK, CARRY, CARRY];
        haulerBuild = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY];
        num_haulers = miners.length * 2;
    } else if (mainSpawnEnergyCap < 800) {
        //Level 2 controller 550 energy
        energyNeeded = 550;
        builderBuild = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY];
        upgraderBuild = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY];
        repairerBuild = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY];
        haulerBuild = [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        num_haulers = miners.length * 2;
    } else if (mainSpawnEnergyCap < 1050) {
        //Level 3 controller 800 energy
        energyNeeded = 800;
        builderBuild = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY];
        upgraderBuild = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY];
        repairerBuild = [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY];
        haulerBuild = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        num_haulers = miners.length; //our haulers are more efficient with bigger bodies, keep less of them (same energy production per tick, bigger creeps)
        num_upgraders = 2;
    } else {
        //Level 4+ controller 1050+ energy
        energyNeeded = 1050;
        builderBuild = [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        upgraderBuild = [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        repairerBuild = [MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY];
        haulerBuild = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
        num_haulers = miners.length;
        num_upgraders = 3;
        num_builders = 3;
        num_repairers = 1;
        num_harvesters = 0;
        enableLongDistanceHarvesters = true;
    }

    /*
    * Begin creep spawn routine
    */
    //Priorities:
    //1. Emergency Harvester if no energy creeps are available
    var needEHarvester = harvesters.length == 0 && miners.length == 0 && Game.spawns.Spawn1.room.energyAvailable <= energyNeeded;

    //2. Make sure each miner has a hauler
    var needHauler = haulers.length < num_haulers && miners.length > 0;

    //3. Create a miner if there are vacant nodes in this room
    var needMiner = mainSpawnEnergyCap > 550 && miners.length < Game.spawns['Spawn1'].room.find(FIND_SOURCES).length;

    //4. Make harvesters
    var needHarvester = harvesters.length < num_harvesters;

    //5. Make upgraders
    var needUpgrader = upgraders.length < num_upgraders;

    //6. Make builders
    var needBuilder = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length > 0 && builders.length < num_builders
    
    //7. Make repairers
    var needRepairer = repairers.length < num_repairers;
    
    //8. Make long distance haulers
    var needLDHarvester = enableLongDistanceHarvesters && longDistanceHarvesters.length < LD_NODES.length;

    //1. Oh crap, we have no harvesters or miners (and we don't have enough energy to spawn a miner)
    if (needEHarvester) {
        var creepName = getRandomName('eHarvester');
        var creepBody = [MOVE, MOVE, WORK, CARRY, CARRY];
        var creepMemory = { role: 'harvester' };
        var result = Game.spawns['Spawn1'].spawnOurCreep(creepName, creepBody, creepMemory)
        if (result == OK) {
            console.log(`Spawning new ${creepMemory.role} ${creepName} With build: ${creepBody}`);        
        }
    }
    //2. If there are miners without haulers, Keep desired number of harvesters
    else if (needHauler) {
        if (haulers.length == 0) { haulerBuild = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]; }
        var creepName = getRandomName('Hauler');
        var creepBody = haulerBuild;
        var creepMemory = { role: 'hauler'};
        var result = Game.spawns['Spawn1'].spawnOurCreep(creepName, creepBody, creepMemory);
        if (result == OK) {
            console.log(`Spawning new ${creepMemory.role} ${creepName} With build: ${creepBody}`);        
        }
    }
    //3. Keep desired number of Miners if we have enough energy cap to do so
    else if (needMiner) {
        var creepName = getRandomName('Miner');
        var creepBody = minerBuild;
        var creepMemory = { 
                    role: 'miner',
                    harvestFromSource: roleMiner.getVacantResourceID(Game.spawns['Spawn1'])
                }
        var result = Game.spawns['Spawn1'].spawnOurCreep(creepName, creepBody, creepMemory);
        if (result == OK) {
            console.log(`Spawning new ${creepMemory.role} ${creepName} With build: ${creepBody}`);        
        }
    }

    //4. Do we need to make harvesters?
    else if (needHarvester) {
        var creepName = getRandomName('Harvester');
        var creepBody = harvesterBuild;
        var creepMemory = {role: 'harvester'};
        var result = Game.spawns['Spawn1'].spawnCreep(creepName, creepBody, creepMemory);
        if (result == OK) {
            console.log(`Spawning new ${creepMemory.role} ${creepName} With build: ${creepBody}`);        
        }
    }

    //5. Keep desired number of upgraders
    else if (needUpgrader) {
        var creepName = getRandomName('Upgrader');
        var creepBody = upgraderBuild;
        var creepMemory = {role: 'upgrader'};
        var result = Game.spawns['Spawn1'].spawnOurCreep(creepName, creepBody, creepMemory);
        if (result == OK) {
            console.log(`Spawning new ${creepMemory.role} ${creepName} With build: ${creepBody}`);        
        }
    }

    //6. Keep desired number of builders (as long as there are build sites)
    else if (needBuilder) {
        var creepName = getRandomName('Builder');
        var creepBody = builderBuild;
        var creepMemory = { role: 'builder'};
        var result = Game.spawns['Spawn1'].spawnOurCreep(creepName, creepBody, creepMemory);
        if (result == OK) {
            console.log(`Spawning new ${creepMemory.role} ${creepName} With build: ${creepBody}`);        
        }
    }

    //7. Keep desired number of repairers
    else if (needRepairer) {
        var creepName = getRandomName('Repairer');
        var creepBody = repairerBuild;
        var creepMemory = { role: 'repairer' };
        var result = Game.spawns['Spawn1'].spawnOurCreep(creepName, creepBody, creepMemory);
        if (result == OK) {
            console.log(`Spawning new ${creepMemory.role} ${creepName} With build: ${creepBody}`);
        }

    }
    //8. Keep desired number of long distance harvesters
    else if (needLDHarvester) {
        let unoccupiedLongDistanceNodeID = getUnnocupiedLongDistanceNodesID();
        //function (name energy, numberOfWorkParts, home, target, sourceIndex) {
        name = Game.spawns['Spawn1'].createLongDistanceHarvester(getRandomName('Harvester'), mainSpawnEnergyCap, 5, HOME, LD_NODES[unoccupiedLongDistanceNodeID][0], LD_NODES[unoccupiedLongDistanceNodeID][1]);
    }

    //output if new creep spawns
    if (Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            { align: 'left', opacity: 0.8 });
    }

    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower
    for (let tower of towers) {
        // run tower logic
        tower.run();
    }

    //Do role actions
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        switch (creep.memory.role){
            case 'harvester':
                roleHarvester.run(creep);
                break;
            case 'upgrader':
                roleUpgrader.run(creep);
                break;
            case 'builder':
                roleBuilder.run(creep);
                break;
            case 'repairer':
                roleRepairer.run(creep);
                break;
            case 'miner':
                roleMiner.run(creep);
                break;                
            case 'hauler':
                roleHauler.run(creep);
                break;
            case 'longDistanceHarvester':
                roleLongDistanceHarvester.run(creep);
                break;
            default:
                console.log("Creep with no role found");
                break;
        }
    }
}
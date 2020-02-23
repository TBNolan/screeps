// Screeps code v0.2.0

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
    ['', 0]
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
    * 
    * Priorities:
    * 1. Emergency Harvester if no energy creeps are available
    * 2. Make sure each miner has a hauler
    * 3. Create a miner if there are vacant nodes in this room
    * 4. Make harvesters
    * 5. Make upgraders
    * 6. Make builders
    * 7. Make repairers
    * 8. Make long distance haulers
    */

    //1. Oh crap, we have no harvesters or miners (and we don't have enough energy to spawn a miner)
    if (harvesters.length == 0 && miners.length == 0 && Game.spawns.Spawn1.room.energyAvailable <= energyNeeded) {
        var newName = 'eHarvester' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep([MOVE, MOVE, WORK, CARRY, CARRY], newName,
            { memory: { role: 'harvester' } });
        if (result == OK) {
            console.log('Spawning new harvester: ' + newName + " With build: move,move,work,carry,carry");
        }
    }
    //2. If there are miners without haulers, Keep desired number of harvesters
    else if (haulers.length < num_haulers && miners.length > 0) {
        if (haulers.length == 0) { haulerBuild = [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]; }
        var newName = 'Hauler' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(haulerBuild, newName,
            { memory: { role: 'hauler' } });
        if (result == OK) {
            console.log('Spawning new hauler: ' + newName + " With build: " + haulerBuild);
        }
    }
    //3. Keep desired number of Miners if we have enough energy cap to do so
    else if (mainSpawnEnergyCap > 550 && miners.length < Game.spawns['Spawn1'].room.find(FIND_SOURCES).length) {
        var newName = 'Miner' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(minerBuild, newName,
            { memory: { role: 'miner' } });
        if (result == OK) {
            console.log('Spawning new miner: ' + newName + " With build: " + minerBuild);
            roleMiner.assignResourceID(creep);
        }
    }

    //4. Do we need to make harvesters?
    else if (harvesters.length < num_harvesters) {
        var newName = 'Harvester' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(harvesterBuild, newName,
            { memory: { role: 'harvester' } });
        if (result == OK) {
            console.log('Spawning new harvester: ' + newName + " With build: " + harvesterBuild);
        }
    }

    //5. Keep desired number of upgraders
    else if (upgraders.length < num_upgraders) {
        var newName = 'Upgrader' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(upgraderBuild, newName,
            { memory: { role: 'upgrader' } });
        if (result == OK) {
            console.log('Spawning new upgrader: ' + newName + " With build: " + upgraderBuild);
        }
    }

    //6. Keep desired number of builders (as long as there are build sites)
    else if (Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length > 0 && builders.length < num_builders) {
        var newName = 'Builder' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(builderBuild, newName,
            { memory: { role: 'builder' } });
        if (result == OK) {
            console.log('Spawning new builder: ' + newName + " Wish build: " + builderBuild);
        }

    }

    //7. Keep desired number of repairers
    else if (repairers.length < num_repairers) {
        var newName = 'Repairer' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(repairerBuild, newName,
            { memory: { role: 'repairer' } });
        if (result == OK) {
            console.log('Spawning new repairer: ' + newName + " With build: " + repairerBuild);
        }

    }
    //8. Keep desired number of long distance harvesters
    else if (enableLongDistanceHarvesters && longDistanceHarvesters.length < LD_NODES.length) {
        let unoccupiedLongDistanceNodeID = getUnnocupiedLongDistanceNodesID();
        //function (energy, numberOfWorkParts, home, target, sourceIndex) {
        name = Game.spawns['Spawn1'].createLongDistanceHarvester(mainSpawnEnergyCap, 5, HOME, LD_NODES[unoccupiedLongDistanceNodeID][0], LD_NODES[unoccupiedLongDistanceNodeID][1]);
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
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
        if (creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role == 'hauler') {
            roleHauler.run(creep);
        }
        if (creep.memory.role == 'longDistanceHarvester') {
            roleLongDistanceHarvester.run(creep);
        }
    }
}
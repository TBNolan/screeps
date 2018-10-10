// Screeps code v0.1.0

/** TODO
 * 1. Fix all screeps trying to mine; there's only 2 access points
 * 2. Figure out how to get upgraders to use other mine node (right now, this is hacked by harvesting sources[1] instead of sources[0])
 */

var roleHarvester = require('role.Harvester');
var roleUpgrader = require('role.Upgrader');
var roleBuilder = require('role.Builder');
var roleRepairer = require('role.Repairer');

//******* Globals **********/
// Squad numbers
var num_harvesters = 2;
var num_upgraders = 3;
var num_builders = 2;
var num_repairers = 1;

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
var moveParts = (mainSpawnEnergyCap * (1/3))/50;
var workParts = (mainSpawnEnergyCap * (1/3))/100;
var carryParts = (mainSpawnEnergyCap * (1/3))/50;

var creepBuild = [];
for (i = 0; i < moveParts; i++){
    creepBuild.push(MOVE);
}
for (i = 0; i < workParts; i++){
    creepBuild.push(WORK);
}
for (i = 0; i < carryParts; i++){
    creepBuild.push(CARRY);
}

//******* End Globals *******//

module.exports.loop = function () {

    //Clear dead creeps from memory
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    //How many harvesters are there?
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    //Oh crap, we have no harvesters
    if (harvesters == 0) {
        var newName = 'eHarvester' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(creepBuild, newName, 
            {memory: {role: 'harvester'}});
        if(result == OK) {
            console.log('Spawning new harvester: ' + newName + " With build: " + creepBuild);
        }
    }
    
    //How many upgraders are there?
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    
    //How many upgraders are there?
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    
    //How many repairers are there?
    var repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');

    //Keep desired number of harvesters
    if(harvesters.length < num_harvesters) {
        var newName = 'Harvester' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(creepBuild, newName, 
            {memory: {role: 'harvester'}});
        if(result == OK) {
            console.log('Spawning new harvester: ' + newName + " With build: " + creepBuild);
        }
    }
    
    //Keep desired number of upgraders
    else if(upgraders.length < num_upgraders) {
        var newName = 'Upgrader' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(creepBuild, newName, 
            {memory: {role: 'upgrader'}});
        if(result == OK) {
            console.log('Spawning new upgrader: ' + newName + " With build: " + creepBuild);    
        }
    }
    
    //Keep desired number of builders
    else if(builders.length < num_builders) {
        var newName = 'Builder' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(creepBuild, newName, 
            {memory: {role: 'builder'}});
        if(result == OK) {
            console.log('Spawning new builder: ' + newName + " Wish build: " + creepBuild);    
        }
        
    }
    
    //Keep desired number of repairers
    else if(repairers.length < num_repairers) {
        var newName = 'Repairer' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(creepBuild, newName, 
            {memory: {role: 'repairer'}});
        if(result == OK) {
            console.log('Spawning new repairer: ' + newName + " With build: " + creepBuild);    
        }
        
    }
    
    //output if new creep spawns
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }

    //Do role actions
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if(creep.memory.role == 'repairer') {
            roleRepairer.run(creep);
        }
    }
}
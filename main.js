// Screeps code v0.0.2

var roleHarvester = require('role.Harvester');
var roleUpgrader = require('role.Upgrader');
var roleBuilder = require('role.Builder');
var roleRepairer = require('role.Repairer');

//******* Globals **********//
// Squad numbers
var num_harvesters = 4;
var num_upgraders = 3;
var num_builders = 2;
var num_repairers = 2;

//Worker builds
var harvester_build = [MOVE, MOVE, WORK, WORK, WORK, CARRY, CARRY, CARRY]; //50+50+50+100+100+100+50+50 = 550
var upgrader_build = [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY]; //50+50+50+50+50+100+100+50+50 = 550
var builder_build = [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY];
var repairer_build = [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY];
var emergency_rebuild_base = [MOVE, MOVE, WORK, CARRY, CARRY];
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
        var result = Game.spawns['Spawn1'].spawnCreep(emergency_rebuild_base, newName, 
            {memory: {role: 'harvester'}});
        if(result == OK) {
            console.log('Spawning new harvester: ' + newName + " With build: " + harvester_build);
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
        var result = Game.spawns['Spawn1'].spawnCreep(harvester_build, newName, 
            {memory: {role: 'harvester'}});
        if(result == OK) {
            console.log('Spawning new harvester: ' + newName + " With build: " + harvester_build);
        }
    }
    
    //Keep desired number of upgraders
    else if(upgraders.length < num_upgraders) {
        var newName = 'Upgrader' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(upgrader_build, newName, 
            {memory: {role: 'upgrader'}});
        if(result == OK) {
            console.log('Spawning new upgrader: ' + newName + " With build: " + upgrader_build);    
        }
    }
    
    //Keep desired number of builders
    else if(builders.length < num_builders) {
        var newName = 'Builder' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(builder_build, newName, 
            {memory: {role: 'builder'}});
        if(result == OK) {
            console.log('Spawning new builder: ' + newName + " Wish build: " + builder_build);    
        }
        
    }
    
    //Keep desired number of repairers
    else if(repairers.length < num_repairers) {
        var newName = 'Repairer' + Game.time;
        var result = Game.spawns['Spawn1'].spawnCreep(repairer_build, newName, 
            {memory: {role: 'repairer'}});
        if(result == OK) {
            console.log('Spawning new repairer: ' + newName + " With build: " + repairer_build);    
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
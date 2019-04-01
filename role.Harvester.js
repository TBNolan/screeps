//harvesters are meant to work on their own. For efficient mining, after a certain room level
//use miner / hauler combos

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.delivering && creep.carry.energy == 0) {
            creep.memory.delivering = false;
            creep.say('Mining');
        }
        if (!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
            creep.memory.delivering = true;
            creep.say('Delivering');
        }

        if (creep.memory.delivering) {
            var my_spawn_buildings = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            var my_extension_buildings = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            var room_containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                        _.sum(structure.store) < structure.storeCapacity;
                }
            });
            var my_energy_buildings = my_extension_buildings.concat(my_spawn_buildings);
            var targets = my_energy_buildings.concat(room_containers); // prioritize spawn buildings
            var targets2 = room_containers.concat(my_energy_buildings); // prioritize storage buildings
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
            else {
                creep.moveTo(Game.flags["idle"]);
            }
        }
        else {
            /*************Need to optimize the harvesters so they all don't go to the dropped resource **********************            
            /*            var dropped_energy = creep.room.find(FIND_DROPPED_RESOURCES);
            /*            if (dropped_energy.length > 0) {
            /*                console.log('found ' + dropped_energy[0].energy + ' energy at ' + dropped_energy[0].pos);
            /*                if(creep.pickup(dropped_energy[0]) == ERR_NOT_IN_RANGE) {
            /*                    creep.moveTo(dropped_energy[0]);
            /*                }
            /*            }*/
            //var sources = creep.room.find(FIND_SOURCES);
            var sources = creep.room.find(FIND_SOURCES);
            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleHarvester;
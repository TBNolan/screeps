//harvesters are meant to work on their own. For efficient mining, after a certain room level
//use miner / hauler combos

var roleHarvester = {

    /** @param {Creep} creep **/
    run: (creep) => {
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
            var closestSource = creep.pos.findClosestByPath(FIND_SOURCES);
            if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
    }
};

module.exports = roleHarvester;
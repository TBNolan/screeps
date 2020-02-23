//Haulers will take resources dropped from miner to energy buildings

var roleHauler = {

        /** @param {Creep} creep **/
        run: function (creep) {
                if (creep.memory.delivering && creep.carry.energy == 0) {
                        creep.memory.delivering = false;
                        creep.say('Collecting');
                }
                if (!creep.memory.delivering && creep.carry.energy == creep.carryCapacity) {
                        creep.memory.delivering = true;
                        creep.say('Delivering');
                }

                if (creep.memory.delivering) {
                        var closestEmptyEnergyBuilding = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                filter: (structure) => {
                                        return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) &&
                                                structure.energy < structure.energyCapacity;
                                }
                        });
                        var myTowers = creep.room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                        return (structure.structureType == STRUCTURE_TOWER) &&
                                                structure.energy < (structure.energyCapacity * 0.7);
                                }
                        })
                        /*var my_energy_buildings = creep.room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                        return (structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) &&
                                                structure.energy < structure.energyCapacity;
                                }
                        });*/
                        var roomContainers = creep.room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                        return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                                                _.sum(structure.store) < structure.storeCapacity;
                                }
                        });
                        var towersAndContainers = myTowers.concat(roomContainers); //in order: towers, containers
                        if (myTowers.length == 0) { creep.memory.delivertingTo = "storage"; }

                        //Alternate between towers and storage
                        if (myTowers.length > 0 && creep.memory.delivertingTo != "storage") {
                                if (creep.transfer(myTowers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(myTowers[0], { visualizePathStyle: { stroke: '#ffffff' } });
                                } else {
                                        creep.memory.delivertingTo = "storage";
                                }
                        } else if (/*roomContainers.length > 0 && */creep.memory.delivertingTo == "storage") {
                                //first try to fill closest empty energy buildings (by path)
                                if (closestEmptyEnergyBuilding) {
                                        if (creep.transfer(closestEmptyEnergyBuilding, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                                creep.moveTo(closestEmptyEnergyBuilding, { visualizePathStyle: { stroke: '#ffffff' } });
                                        }
                                        else {
                                                creep.memory.delivertingTo = "tower";
                                        }
                                }
                                else if (creep.transfer(roomContainers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(roomContainers[0], { visualizePathStyle: { stroke: '#ffffff' } });
                                } else {
                                        creep.memory.delivertingTo = "tower";
                                }
                        }
                        //everything is full, be idle
                        else {
                                creep.moveTo(Game.flags["idle"]);
                        }
                }
                else {
                        //creep hasn't chosen a dropped resource yet
                        if (creep.memory.droppedEnergyID == null) {
                                var dropped_energy = creep.room.find(FIND_DROPPED_RESOURCES);
                                if (dropped_energy.length > 0) {
                                        creep.memory.droppedEnergyID = dropped_energy[0].id;
                                }

                        } else {
                                //creep has chosen a dropped resource

                                //Dropped energy doesn't exist anymore
                                if (!Game.getObjectById(creep.memory.droppedEnergyID)) {
                                        creep.memory.droppedEnergyID = null;
                                        creep.memory.delivering = true;
                                } else {
                                        if (creep.pickup(Game.getObjectById(creep.memory.droppedEnergyID)) == ERR_NOT_IN_RANGE) {
                                                creep.moveTo(Game.getObjectById(creep.memory.droppedEnergyID));
                                        }
                                }
                        }
                }
        }
};

module.exports = roleHauler;
var roleRepair = {
    
    run: function(creep) {
        
        if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.memory.repairTargetID = 0;
            creep.say('🔄 harvest');
            var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
	            filter: (containers) => containers.structureType == STRUCTURE_CONTAINER &&
	                                    containers.store[RESOURCE_ENERGY] > 0
	        });
	        if (containersWithEnergy.length > 0){
	            creep.memory.harvest_from = "container";
	            creep.memory.harvest_id = containersWithEnergy[0].id;
	        } else {
	            creep.memory.harvest_from = "source";
	            creep.memory.harvest_id = "";
	        }
	        
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.repairing = true;
	        creep.say('🚧 repairing');
	    }

        if(creep.memory.repairing) {
            
            if (!creep.memory.repairTargetID || creep.memory.repairTargetID == 0) {
                const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < (object.hitsMax * 0.85)
                });
            
                targets.sort((a,b) => a.hits - b.hits);
                if (targets.length > 0 ) {
                    creep.memory.repairTargetID = targets[0].id;
                }
                else {
                    creep.memory.repairTargetID = 0;
                    creep.moveTo(Game.flags["idle"]);
                }
            }
	        
            
            if(creep.memory.repairTargetID) {
                var targetHits = Game.getObjectById(creep.memory.repairTargetID).hits;
                var targetMax = Game.getObjectById(creep.memory.repairTargetID).hitsMax;
                if(targetHits == targetMax) {
                    creep.memory.repairTargetID = 0;
                }
                else if(creep.repair(Game.getObjectById(creep.memory.repairTargetID)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.repairTargetID));
                }
            }
        }
        else {
	        var sources = creep.room.find(FIND_SOURCES);
	        if (creep.memory.harvest_from == "container"){
	            var harvest_from_object = Game.getObjectById(creep.memory.harvest_id);
	            if (harvest_from_object.store[RESOURCE_ENERGY] == 0) {
	                creep.memory.building = true;
	            }
	            else if(creep.withdraw(harvest_from_object, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(harvest_from_object, {visualizePathStyle: {stroke: '#ffaa00'}});
	            }
	        }
            else if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
    }
};

module.exports = roleRepair;
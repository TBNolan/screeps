var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
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
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else if (targets.length == 0) {
                creep.moveTo(Game.flags["idle"]);
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

module.exports = roleBuilder;
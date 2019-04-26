var roleBuilder = {

	/** @param {Creep} creep **/
	run: function (creep) {

		if (creep.memory.building && creep.carry.energy == 0) {
			//we just finished building
			creep.memory.building = false;
			creep.say('🔄 harvest');
			var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
				filter: (containers) => (containers.structureType == STRUCTURE_CONTAINER || containers.structureType == STRUCTURE_STORAGE) &&
					containers.store[RESOURCE_ENERGY] > 0
			});
			if (containersWithEnergy.length > 0) {
				//go get energy from a container
				creep.memory.harvest_from = "container";
				creep.memory.harvest_id = containersWithEnergy[0].id;
			} else {
				//gotta find some on the ground or harvest ourselves
				creep.memory.harvest_from = "source";
				creep.memory.harvest_id = "";
			}

		}
		if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
			//just picked up all the energy we can carry, go build
			creep.memory.building = true;
			creep.say('🚧 build');
		}

		if (creep.memory.building) {
			//time to build, where should we go?
			var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
			if (targets.length > 0) {
				if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
				}
			}
			else if (targets.length == 0) {
				//we're full on energy and there's nothing to build
				creep.moveTo(Game.flags["idle"]);
			}
		}
		else {
			//we decided there's resources in a container, go get them
			if (creep.memory.harvest_from == "container") {
				var harvest_from_object = Game.getObjectById(creep.memory.harvest_id);
				if (harvest_from_object.store[RESOURCE_ENERGY] == 0) {
					creep.memory.building = true;
				}
				else if (creep.withdraw(harvest_from_object, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(harvest_from_object, { visualizePathStyle: { stroke: '#ffaa00' } });
				}
			}
			else {
				//all containers are empty, is there some on the ground?
				var dropped_energy = creep.room.find(FIND_DROPPED_RESOURCES);
				if (dropped_energy.length > 0) {
					if (creep.pickup(dropped_energy[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(dropped_energy[0]);
					}
				} else {
					//no energy in containers, and none on the ground, gotta harvest ourselves.
					var sources = creep.room.find(FIND_SOURCES);
					if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
					}
				}
			}
		}
	}
};

module.exports = roleBuilder;
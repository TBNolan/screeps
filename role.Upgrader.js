var roleUpgrader = {

	/** @param {Creep} creep **/
	run: function (creep) {

		if (creep.memory.upgrading && creep.carry.energy == 0) {
			creep.memory.upgrading = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
			creep.memory.upgrading = true;
			creep.say('⚡ upgrade');
		}

		if (creep.memory.upgrading) {
			if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
			}
		}
		else {
			var dropped_energy = creep.room.find(FIND_DROPPED_RESOURCES);
			if (dropped_energy.length > 0) {
				if (creep.pickup(dropped_energy[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(dropped_energy[0]);
				}
			}
			var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {
				filter: (containers) => (containers.structureType == STRUCTURE_CONTAINER || containers.structureType == STRUCTURE_STORAGE) &&
					containers.store[RESOURCE_ENERGY] > 0
			});
			var closestSource = creep.pos.findClosestByPath(FIND_SOURCES);
			if (containersWithEnergy.length > 0) {
				if (creep.withdraw(containersWithEnergy[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(containersWithEnergy[0], { visualizePathStyle: { stroke: '#ffaa00' } });
				}
			}
			else if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
				creep.moveTo(closestSource, { visualizePathStyle: { stroke: '#ffaa00' } });
			}
		}
	}
};

module.exports = roleUpgrader;
// create a new function for StructureTower
StructureTower.prototype.run =
    function () {
        // find closes hostile creep
        var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var freshlyBuiltWall = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < 1000 && structure.structureType != STRUCTURE_CONTROLLER
        });
        var criticallyDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < (structure.hitsMax * 0.0001)
        });
        var closestSlightlyDamagedWall = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < (structure.hitsMax * 0.01) && structure.structureType === STRUCTURE_WALL
        });
        var closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < (structure.hitsMax * 0.15) && structure.structureType != STRUCTURE_WALL
        });
        if (closestHostile) {
            this.attack(closestHostile);
            //var username = closestHostile.owner.username;
            //Game.notify(`User ${username} spotted`, 180); //notify once every 3 hours if enemy found
        }
        if (!closestHostile) {
            for (let name in Game.creeps) {
                // get the creep object
                var creep = Game.creeps[name];
                if (creep.hits < creep.hitsMax) {
                    this.heal(creep);
                }
            }
        }
        if (freshlyBuiltWall && (this.energy > this.energyCapacity * 0.10)) {
            this.repair(freshlyBuiltWall);
        }
        else if (criticallyDamagedStructure && (this.energy > this.energyCapacity * 0.25)){
            this.repair(criticallyDamagedStructure);
        }
        else if (closestDamagedStructure && (this.energy > (this.energyCapacity * 0.50))) {
            this.repair(closestDamagedStructure);
        }
        else if (closestSlightlyDamagedWall && (this.energy > this.energyCapacity * 0.50)){
            this.repair(closestSlightlyDamagedWall);
        }
    }
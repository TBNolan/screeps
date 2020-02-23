// create a new function for StructureTower
StructureTower.prototype.run =
    function () {
        // find closes hostile creep
        var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < (structure.hitsMax * 0.15)
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
        if (closestDamagedStructure && (this.energy > (this.energyCapacity * 0.5))) {
            this.repair(closestDamagedStructure);
        }
    }
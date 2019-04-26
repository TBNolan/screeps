// create a new function for StructureTower
StructureTower.prototype.run =
    function () {
        // find closes hostile creep
        var closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        var closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestHostile) {
            this.attack(closestHostile);
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted`, 180); //notify once every 3 hours if enemy found
        } else if (closestDamagedStructure) {
            this.repair(closestDamagedStructure);
        }
    }
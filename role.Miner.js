//Miners don't carry and are meant to stay at a node 
//Place on top of container or allow resources to drop

var roleMiner = {

        /** @param {Creep} creep **/
        run: (creep) => {
                if (creep.harvest(Game.getObjectById(creep.memory.harvestFromSource)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.harvestFromSource), { visualizePathStyle: { stroke: '#ffaa00' } });
                }
        },
        getVacantResourceID: (spawn) => {
                //look for other miners in room
                let otherMiners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.ticksToLive > 50);
                let roomSources = spawn.room.find(FIND_SOURCES);
                //Look through the sources in the room
                for (let i = 0; i < roomSources.length; i++) {
                        let thisSourceHasAMiner = false;
                        //See if the miners in the room are mining from this source
                        for (let j = 0; j < otherMiners.length; j++) {
                        if (otherMiners[j].memory.harvestFromSource == roomSources[i].id) {
                                        thisSourceHasAMiner = true;
                                }
                        }
                        //No miner found this iteration, return the sourceID
                        if (!thisSourceHasAMiner) {
                                console.log(`Found a vacant source with ID ${roomSources[i].id}`);
                                return roomSources[i].id;
                        }
                }
                return "No vacant sources found";
        }
        

};

module.exports = roleMiner;
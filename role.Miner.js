//Miners don't carry and are meant to stay at a node 
//Place on top of container or allow resources to drop

var roleMiner = {

        /** @param {Creep} creep **/
        run: function (creep) {
                //look for other miners in room
                let otherMiners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
                let roomSources = creep.room.find(FIND_SOURCES);
                if (!creep.memory.harvestFromSource) {
                        //Look through the sources in the room
                        for (let i = 0; i < roomSources.length; i++) {
                                let thisSourceHasAMiner = false;
                                //See if the miners in the room are mining from this source
                                for (let j = 0; j < otherMiners.length; j++) {
                                        if (otherMiners[j].memory.harvestFromSource == roomSources[i].id) {
                                                thisSourceHasAMiner = true;
                                        }
                                }
                                //No miner found this iteration, sign this miner up!
                                if (!thisSourceHasAMiner) {
                                        console.log(`Assigning miner ${creep.name} to source with ID ${roomSources[i].id}`);
                                        creep.memory.harvestFromSource = roomSources[i].id;
                                }
                        }
                }

                //Get creep to resource
                //var sources = creep.room.find(FIND_SOURCES);
                //if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                //        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
                //}
                if (creep.harvest(Game.getObjectById(creep.memory.harvestFromSource)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.harvestFromSource), { visualizePathStyle: { stroke: '#ffaa00' } });
                }
        }

};

module.exports = roleMiner;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using Web.Models;
using Web.Repositories;
using Web.ViewModels;

namespace Web.Controllers
{
    [Authorize(Roles = "Admin")]
    public class DataController : ApiController
    {
        private readonly ISpeakerRepository _speakerRepository;
        private readonly ISessionRepository _sessionRepository;

        public DataController(ISpeakerRepository speakerRepository, ISessionRepository sessionRepository)
        {
            this._speakerRepository = speakerRepository;
            this._sessionRepository = sessionRepository;
        }

        [HttpPut]
        [Route("api/{eventId}/data/syncSpeakers")]
        public void SyncSpeakers(String eventId) //pk
        {
            var allSpeakers = _speakerRepository.GetByPk(eventId);
            var sessions = _sessionRepository.GetAllEntries(eventId).ToList();

            // for each session, update speaker's name
            for(int i=0; i < sessions.Count(); i++)
            {
                var session = sessions[i];

                if (string.IsNullOrWhiteSpace(session.Speakers))
                {
                    sessions[i].Speakers = null;
                }
                else
                {
                    var relatedSpeakers = new List<RelatedSpeaker>();
                    var relatedSpeakersOld = JsonConvert.DeserializeObject<List<string>>(session.Speakers);
                    foreach (var speakerId in relatedSpeakersOld)
                    {
                        relatedSpeakers.Add(new RelatedSpeaker{
                            Id = speakerId,
                            Name = allSpeakers.FirstOrDefault(x => x.SpeakerId == speakerId).Name 
                        });
                    }

                    sessions[i].Speakers = JsonConvert.SerializeObject(relatedSpeakers);
                }            
            }

            // remove the line below to persist data:
            //_sessionRepository.MergeEntities(sessions);
        }

    }

}

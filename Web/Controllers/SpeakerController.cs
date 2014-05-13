using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using Web.Models;
using System.Net;

using Microsoft.WindowsAzure;
using System.Web;
using Web.Helpers;
using Newtonsoft.Json;
using Web.ViewModels;
using System.Web.Http.Controllers;
using Web.Repositories;


namespace Web.Controllers
{
    //[RoutePrefix("api")]
    public class SpeakerController : ApiController
    {

        private readonly ISpeakerRepository _speakerRepository;

        public SpeakerController(ISpeakerRepository speakerRepository)
        {
            this._speakerRepository = speakerRepository;
        }

        [Route("api/{eventId}/speakers")]
        public IEnumerable<SpeakerViewModel> Get(String eventId) //pk
        {
            return _speakerRepository.GetByPk(eventId);
        }

        [Route("api/{eventId}/speakers/{speakerId}")]
        public SpeakerViewModel Get(String eventId, String speakerId) //pk, rk
        {
            return _speakerRepository.GetByKeys(eventId, speakerId);
        }

    }
}
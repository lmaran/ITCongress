using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Web.Http;
using Web.Repositories;

namespace Web.Controllers
{
    //[Authorize(Roles = "Admin")]
    [Authorize]
    public class AttendeesController : ApiController
    {

        private readonly IAttendeeRepository _attendeeRepository;
        private readonly ISessionRepository _sessionRepository;

        public AttendeesController(IAttendeeRepository attendeeRepository, ISessionRepository sessionRepository)
        {
            this._attendeeRepository = attendeeRepository;
            this._sessionRepository = sessionRepository;
        }


        [HttpGet]
        [Route("api/{eventId}/MySchedule")]
        public IEnumerable<string> Get(string eventId)
        {
            //var cp = User as ClaimsPrincipal;
            //var xxx = cp.Claims.Select(x => x.Type + ", " + x.Value);
            //var roles = cp.FindAll(ClaimTypes.Role);

            var email = User.Identity.Name;           
            return _attendeeRepository.Get(eventId, email);
        }


        [HttpPost]
        [Route("api/{eventId}/MySchedule")]
        public void Post(string eventId, [FromBody]SessionTmp sessionId)
        {
            var email = User.Identity.Name;
            _attendeeRepository.Add(eventId, sessionId.SessionId, email);
            _sessionRepository.IncrementCurrentAttendees(eventId, sessionId.SessionId);
        }


        [HttpPut]
        [Route("api/{eventId}/MySchedule")]
        public void Put(string eventId, [FromBody]SessionTmp sessionId)
        {
            var email = User.Identity.Name;
            _attendeeRepository.Update(eventId, sessionId.SessionId, email);
            _sessionRepository.DecrementCurrentAttendees(eventId, sessionId.SessionId);
        }

    }

    public class SessionTmp
    {
        public string SessionId { get; set; }
    }
}

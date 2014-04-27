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
    public class SessionsController : ApiController
    {

        private readonly ISessionRepository _sessionRepository;

        public SessionsController(ISessionRepository sessionRepository)
        {
            this._sessionRepository = sessionRepository;
        }

        [Route("api/{eventId}/sessions")]
        public IEnumerable<SessionViewModel> Get(String eventId) //pk
        {
            return _sessionRepository.GetByPk(eventId);
        }

        //GET /v1/events/968000000_it-congress/eventsessions/dell
        public SessionViewModel Get(String eventId, String id) //pk, rk
        {
            return _sessionRepository.GetByKeys(eventId, id);
        }

    }
}
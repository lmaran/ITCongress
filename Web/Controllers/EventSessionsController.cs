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
    public class EventSessionsController : ApiController
    {

        private readonly IEventSessionRepository _eventSessionRepository;

        public EventSessionsController()
            : this(new EventSessionRepository())
        {
        }

        public EventSessionsController(IEventSessionRepository eventSessionRepository)
        {
            this._eventSessionRepository = eventSessionRepository;
        }

        //GET /v1/events/968000000_it-congress/eventsessions
        [Route("api/{eventId}/eventSessions")]
        public IEnumerable<EventSessionViewModel> Get(String eventId) //pk
        {
            return _eventSessionRepository.GetByPk(eventId);
        }

        //GET /v1/events/968000000_it-congress/eventsessions/dell
        public EventSessionViewModel Get(String eventId, String id) //pk, rk
        {
            return _eventSessionRepository.GetByKeys(eventId, id);
        }

    }
}
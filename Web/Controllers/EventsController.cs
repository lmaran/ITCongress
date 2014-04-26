using Web.Models;
using Web.Repositories;
using Web.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Web.Controllers
{
    public class EventsController : ApiController
    {

        private readonly IEventRepository _eventRepository;

        public EventsController()            //: this(AzureTableContext.DefaultAzureTableContext())
            : this(new EventRepository())
        {
        }

        public EventsController(IEventRepository eventRepository)
        {
            this._eventRepository = eventRepository;
        }

        // GET api/events
        public IEnumerable<EventViewModel> Get()
        {
            //return new string[] { "value1", "value2" };

            var e = _eventRepository.GetAll();
            return e;
        }


    }
}

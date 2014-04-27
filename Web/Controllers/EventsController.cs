using System.Collections.Generic;
using System.Web.Http;
using Web.Models;
using Web.Repositories;
using Web.ViewModels;


namespace Web.Controllers
{
    public class EventsController : ApiController
    {

        private readonly IEventRepository _eventRepository;

        public EventsController(IEventRepository eventRepository)
        {
            this._eventRepository = eventRepository;
        }

        [Route("api/events")]
        public IEnumerable<EventViewModel> Get()
        {
            return _eventRepository.GetAll();
        }


    }
}

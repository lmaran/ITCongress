//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web;

//using System.Web.Http.Controllers;
//using Web.Helpers;
//using System.Net.Http;
//using System.Net;
//using Web.ViewModels;
//using Web.Models;
//using Newtonsoft.Json;
//using Newtonsoft.Json.Linq;
//using System.Web.Http;
//using Web.Repositories;


//namespace Web.Controllers
//{

//    public class RegisteredAttendeesController : ApiController
//    {
//        private readonly ISessionRepository _eventSessionRepository;

//        public RegisteredAttendeesController(ISessionRepository eventSessionRepository)
//        {
//            this._eventSessionRepository = eventSessionRepository;
//        }


//        // POST  /v1/events/968000000_it-congress/eventsessions/oracle_2/registeredattendees/111
//        public HttpResponseMessage Post(string eventId, string eventSessionId, RegisteredAttendee registeredAttendee)
//        {
//            if (!ModelState.IsValid)
//            {
//                var errors = new JArray();
//                foreach (var prop in ModelState.Values)
//                {
//                    if (prop.Errors.Any())
//                    {
//                        errors.Add(prop.Errors.First().ErrorMessage);
//                    }
//                }
//                return Request.CreateResponse(HttpStatusCode.BadRequest, errors);
//            }

//            // get event
//            var i = _eventSessionRepository.GetByKeys(eventId, eventSessionId);
//            if (i == null) throw new HttpResponseException(HttpStatusCode.NotFound);

//            if (i.RegisteredAttendees.Where(x => x.Id == registeredAttendee.Id).Count() > 0)
//            {
//                registeredAttendee.Name = "Already Registered";
//                return Request.CreateResponse(HttpStatusCode.OK, registeredAttendee);
//            }

//            // add person
//            i.RegisteredAttendees.Add(registeredAttendee);
//            var serializedRegisteredAttendees = JsonConvert.SerializeObject(i.RegisteredAttendees);

//            // save to Azure Table
//            _eventSessionRepository.UpdateProperty(eventId, eventSessionId, "RegisteredAttendees", serializedRegisteredAttendees);

//            return Request.CreateResponse(HttpStatusCode.Created, registeredAttendee);
//        }



//        // Delete  /v1/events/968000000_it-congress/eventsessions/oracle_2/registeredattendees/111
//        public HttpResponseMessage Delete(string eventId, string eventSessionId, string id)
//        {
//            if (!ModelState.IsValid)
//            {
//                var errors = new JArray();
//                foreach (var prop in ModelState.Values)
//                {
//                    if (prop.Errors.Any())
//                    {
//                        errors.Add(prop.Errors.First().ErrorMessage);
//                    }
//                }
//                return Request.CreateResponse(HttpStatusCode.BadRequest, errors);
//            }

//            // get event
//            var i = _eventSessionRepository.GetByKeys(eventId, eventSessionId);
//            if (i == null) throw new HttpResponseException(HttpStatusCode.NotFound);

//            // person not exist
//            if (i.RegisteredAttendees.Where(x => x.Id == id).Count() == 0)
//                return new HttpResponseMessage(HttpStatusCode.NotFound);

//            // remove person
//            i.RegisteredAttendees.RemoveAll(x => x.Id == id); 
//            var serializedRegisteredAttendees = JsonConvert.SerializeObject(i.RegisteredAttendees);

//            // save to Azure Table
//            _eventSessionRepository.UpdateProperty(eventId, eventSessionId, "RegisteredAttendees", serializedRegisteredAttendees);

//            return new HttpResponseMessage(HttpStatusCode.NoContent);
//        }

//    }
//}

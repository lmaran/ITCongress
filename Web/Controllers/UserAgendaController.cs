using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using Web.Models;
using System.Net;

using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Storage;
using System.Web;
using Newtonsoft.Json;
using Web.ViewModels;
using Newtonsoft.Json.Linq;
using System.Web.Http.Controllers;
using Web.Repositories;



namespace Web.Controllers
{

    public class UserAgendaController : ApiController
    {

        private readonly IEventSessionRepository _eventSessionRepository;

        public UserAgendaController()
            : this(new EventSessionRepository())
        {
        }

        public UserAgendaController(IEventSessionRepository eventSessionRepository)
        {
            this._eventSessionRepository = eventSessionRepository;
        }



        // GET /v1/events/968000000_it-congress/useragenda/111
        public IEnumerable<UserAgendaOnDay> Get(string eventId, string id)
        {
            var entities = _eventSessionRepository.GetByPk(eventId);

            var entityVM = new List<UserAgendaOnDay>();

            var agendaOnDay = new List<UserAgendaOnDay>();
            var agendaOnHour = new List<UserAgendaOnHour>();
            var agendaOnRoom = new List<UserAgendaOnRoom>();

            var currentAgendaOnDay = new UserAgendaOnDay();
            var currentAgendaOnHour = new UserAgendaOnHour();
            var currentAgendaOnRoom = new UserAgendaOnRoom();

            //ordonez a.i. lista sa se parcurga ordonat, dintr-o singura trecere
            foreach (var i in entities.ToList().OrderBy(a => a.BeginOn).ThenBy(a => a.Room))
            {
                currentAgendaOnRoom = new UserAgendaOnRoom { Room =  i.Room, EventSession = i };

                if (i.BeginOn.DayOfYear != currentAgendaOnDay.Day.DayOfYear) //la prima parcurgere sau daca se schimba ziua
                {
                    currentAgendaOnHour = new UserAgendaOnHour
                    {
                        Hour = i.BeginOn,
                        UserAgendaOnRooms = new List<UserAgendaOnRoom> { currentAgendaOnRoom }
                    };

                    currentAgendaOnRoom.SessionStateForUser = GetUserStateForSession(id, i);
                    if (currentAgendaOnRoom.SessionStateForUser == "Registered")
                        currentAgendaOnHour.HourUserIsBusy = true;
                    else
                        currentAgendaOnHour.HourUserIsBusy = false;


                    currentAgendaOnDay = new UserAgendaOnDay
                    {
                        Day = i.BeginOn,
                        UserAgendaOnHours = new List<UserAgendaOnHour> { currentAgendaOnHour }
                    };

                    agendaOnDay.Add(currentAgendaOnDay);
                    currentAgendaOnDay.Day = i.BeginOn;
                }

                else // i.BeginOn.DayOfYear == currentAgendaOnDay.Day.DayOfYear    ramanem in ac. zi
                {

                    if (i.BeginOn == currentAgendaOnHour.Hour)
                    {
                        currentAgendaOnRoom.SessionStateForUser = GetUserStateForSession(id, i);
                        if (currentAgendaOnRoom.SessionStateForUser == "Registered")
                            currentAgendaOnHour.HourUserIsBusy = true;

                        currentAgendaOnHour.UserAgendaOnRooms.Add(currentAgendaOnRoom);
                    }

                    else
                    {
                        currentAgendaOnHour = new UserAgendaOnHour
                        {
                            Hour = i.BeginOn,
                            //HourUserIsBusy = false, //reseteaza flagul cand se trece la ora noua
                            UserAgendaOnRooms = new List<UserAgendaOnRoom> { currentAgendaOnRoom }
                        };

                        currentAgendaOnRoom.SessionStateForUser = GetUserStateForSession(id, i);
                        if (currentAgendaOnRoom.SessionStateForUser == "Registered")
                            currentAgendaOnHour.HourUserIsBusy = true;
                        else
                            currentAgendaOnHour.HourUserIsBusy = false;


                        currentAgendaOnDay.UserAgendaOnHours.Add(currentAgendaOnHour);
                    }
                    currentAgendaOnHour.Hour = i.BeginOn;
                };
            }

            return agendaOnDay;
        }


        //helper method
        private string GetUserStateForSession(string UserId, EventSessionViewModel i)
        {
            if (i.RegisteredAttendees == null)
                return "Unregistered";

            if (i.RegisteredAttendees.Where(a => a.Id == UserId).FirstOrDefault() != null)
                return "Registered";
            else
                if (i.RegisteredAttendees.Count() >= i.MaxAttendees)
                    return "Full";
                else
                    return "Unregistered";
        }


    }
}
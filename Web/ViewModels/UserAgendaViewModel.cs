using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{
    public class UserAgendaOnDay
    {
        public DateTime Day { get; set; }
        public List<UserAgendaOnHour> UserAgendaOnHours { get; set; }
    }

    public class UserAgendaOnHour
    {
        public DateTime Hour { get; set; }
        public bool HourUserIsBusy { get; set; }
        public List<UserAgendaOnRoom> UserAgendaOnRooms { get; set; }
    }

    public class UserAgendaOnRoom
    {
        public string Room { get; set; }
        public string SessionStateForUser { get; set; } //Registered, Unregistered, Busy, Full
        public SessionViewModel EventSession { get; set; }
    }
}



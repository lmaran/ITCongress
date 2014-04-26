using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{
    public class AgendaOnDay
    {
        public DateTime Day { get; set; }
        public List<AgendaOnHour> AgendaOnHours { get; set; }
    }

    public class AgendaOnHour
    {
        public DateTime Hour { get; set; }
        public List<AgendaOnRoom> AgendaOnRooms { get; set; }
    }

    public class AgendaOnRoom
    {
        public string Room { get; set; }
        public EventSessionViewModel EventSession { get; set; }
    }
}



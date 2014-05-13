using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{
    public class SessionViewModel
    {
        public string EventId { get; set; } // PK
        public string SessionId { get; set; } // RK

        public string Brand { get; set; }
        public string Title { get; set; }
        public List<string> Speakers { get; set; }
        public Int32 MaxAttendees { get; set; }
        public Int32 CurrentAttendees { get; set; }
        public Int32 Duration { get; set; } // in session length, in minutes

    }


}



using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{
    public class EventViewModel
    {
        public string EventYear { get; set; } // PK (e.g. 2014)
        public string EventId { get; set; } // RK (e.g. itcongress2014)

        public string Title { get; set; }
        public string Description { get; set; }

    }

}



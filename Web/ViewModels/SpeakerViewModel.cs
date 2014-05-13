using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{

    public class SpeakerViewModel
    {
        public string EventId { get; set; } // Ex: itcongress2014
        public string SpeakerId { get; set; } // slug(fullName) Ex: lucian-maran

        public string Name { get; set; } // full name
        public string Title { get; set; }
        public string Bio { get; set; }
        public bool HasPicture { get; set; }
    }

}



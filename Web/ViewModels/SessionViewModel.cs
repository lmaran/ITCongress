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
        public string SessionId { get; set; } //RK

        public string Brand { get; set; }
        public string Title { get; set; }
        public List<Speaker> Speakers { get; set; } // serializat Json...Azure nu permite tipul List<T>; speakeri
        public Int32 MaxAttendees { get; set; }
        public Int32 CurrentAttendees { get; set; }
        public Int32 Duration { get; set; } // in session length, in minutes

    }

    public class Speaker
    {
        public string Id { get; set; } // slug(fullName) Ex: lucian-maran
        public string FullName { get; set; }
        public string Title { get; set; }
        public string PictureUrl { get; set; }
        public string Description { get; set; } // TODO: move it to a separate entity (not directly related to session)
    }

}



using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{
    public class EventSessionViewModel
    {

        //when
        public DateTime BeginOn { get; set; }
        public DateTime EndOn { get; set; }

        //where
        public string Address { get; set; }
        public string Room { get; set; }

        //what
        public string EventSessionId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; } //format HTML, poate vrei sa memorezi numele si url-ul prezentatorilor
        public string Url { get; set; } //spre o pagina exterioara cu detalii
        public List<Presenter> Presenters { get; set; } //serializat Json...Azure nu permite tipul List<T>; speakeri

        //attendees
        public Int32 MaxAttendees { get; set; }
        public List<RegisteredAttendee> RegisteredAttendees { get; set; } //serializat Json...Azure nu permite tipul List<T>
        //public string Attendees { get; set; } //serializat Json...Azure nu permite tipul List<T>
    }

    public class Presenter
    {
        public string Name { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
    }

    public class RegisteredAttendee
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

}



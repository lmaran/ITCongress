using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{

    public class UserDetailViewModel
    {
        //public string EventId { get; set; } // Ex: itcongress2015
        public string Email { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Company { get; set; }
        public string Title { get; set; }
        public string Phone { get; set; }
        public string Owner { get; set; } // e.g. Eta2u sales person
    }

    public class UserDetailViewModelWithPsw
    {
        //public string EventId { get; set; } // Ex: itcongress2015
        public string Email { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Company { get; set; }
        public string Title { get; set; }
        public string Phone { get; set; }
        public string Owner { get; set; } // e.g. Eta2u sales person
        public bool HasPassword { get; set; }
    }
}



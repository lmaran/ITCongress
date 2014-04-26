using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using Web.Helpers;
using Microsoft.WindowsAzure.Storage.Table;

namespace Web.Models
{
    public class EventSessionEntry : TableEntity
    {
        //vezi http://robbincremers.me/2012/03/01/everything-you-need-to-know-about-windows-azure-table-storage-to-use-a-scalable-non-relational-structured-data-store/
        //2 constructori
        public EventSessionEntry()
        {
            base.PartitionKey = "eta2u";
            base.RowKey = RemainingTime.Seconds().ToString() + "_" + Guid.NewGuid().ToString(); //ca sa pot afisa ultimele "x" inregistrari...vezi "AzureTable Strategy.docx"
        }

        public EventSessionEntry(string partitionKey, string rowKey)
        {
            base.PartitionKey = partitionKey;
            base.RowKey = rowKey;
        }


        //when
        public DateTime BeginOn { get; set; }
        public DateTime EndOn { get; set; }

        //where
        public string Address { get; set; }
        public string Room { get; set; }

        //what
        public string Title { get; set; }
        public string Description { get; set; } //format HTML, poate vrei sa memorezi numele si url-ul prezentatorilor
        public string Url { get; set; } //spre o pagina exterioara cu detalii
        public string Presenters { get; set; } //serializat Json...Azure nu permite tipul List<T>; speakeri

        //attendees
        public Int32 MaxAttendees { get; set; }
        public string RegisteredAttendees { get; set; } //serializat Json...Azure nu permite tipul List<T>
        //public string Attendees { get; set; } //serializat Json...Azure nu permite tipul List<T>

    }
}

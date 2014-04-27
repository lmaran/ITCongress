using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using Web.Helpers;
using Microsoft.WindowsAzure.Storage.Table;

namespace Web.Models
{
    public class SessionEntry : TableEntity
    {
        //vezi http://robbincremers.me/2012/03/01/everything-you-need-to-know-about-windows-azure-table-storage-to-use-a-scalable-non-relational-structured-data-store/
        //2 constructori
        public SessionEntry()
        {
            base.PartitionKey = "eta2u";
            base.RowKey = RemainingTime.Seconds().ToString() + "_" + Guid.NewGuid().ToString(); //ca sa pot afisa ultimele "x" inregistrari...vezi "AzureTable Strategy.docx"
        }

        public SessionEntry(string partitionKey, string rowKey)
        {
            base.PartitionKey = partitionKey;
            base.RowKey = rowKey;
        }

        public string Brand { get; set; }
        public string Title { get; set; }
        public string Speakers { get; set; } // serializat Json...Azure nu permite tipul List<T>; speakeri
        public Int32 MaxAttendees { get; set; }
        public Int32 CurrentAttendees { get; set; }
        public Int32 Duration { get; set; } // in session length, in minutes

    }
}

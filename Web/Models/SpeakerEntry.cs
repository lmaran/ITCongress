using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Web.Helpers;

namespace Web.Models
{
    public class SpeakerEntry : TableEntity
    {
        public SpeakerEntry()
        {
            base.PartitionKey = "itcongress2014";
            base.RowKey = RemainingTime.Seconds().ToString() + "_" + Guid.NewGuid().ToString(); //ca sa pot afisa ultimele "x" inregistrari...vezi "AzureTable Strategy.docx"
        }

        public SpeakerEntry(string partitionKey, string rowKey)
        {
            base.PartitionKey = partitionKey;
            base.RowKey = rowKey;
        }

        public string Name { get; set; }
        public string Title { get; set; }
        public string Bio { get; set; }
        public bool HasPicture { get; set; }

    }
}
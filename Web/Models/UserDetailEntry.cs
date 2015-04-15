using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Web.Helpers;

namespace Web.Models
{
    public class UserDetailEntry : TableEntity
    {
        public UserDetailEntry()
        {
            base.PartitionKey = "itcongress2015";
            base.RowKey = RemainingTime.Seconds().ToString() + "_" + Guid.NewGuid().ToString(); //ca sa pot afisa ultimele "x" inregistrari...vezi "AzureTable Strategy.docx"
        }

        public UserDetailEntry(string partitionKey, string rowKey)
        {
            base.PartitionKey = partitionKey;
            base.RowKey = rowKey;
        }

        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Company { get; set; }
        public string Title { get; set; }
        public string Phone { get; set; }
        public string Owner { get; set; } // e.g. Eta2u sales person

    }
}
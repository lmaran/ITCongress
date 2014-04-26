using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using Web.Helpers;
using Microsoft.WindowsAzure.Storage.Table;

namespace Web.Models
{
    public class EventEntry : TableEntity
    {
        //vezi http://robbincremers.me/2012/03/01/everything-you-need-to-know-about-windows-azure-table-storage-to-use-a-scalable-non-relational-structured-data-store/
        //2 constructori
        public EventEntry()
        {
            base.PartitionKey = "eta2u";
            base.RowKey = RemainingTime.Seconds().ToString() + "_" + Guid.NewGuid().ToString(); //ca sa pot afisa ultimele "x" inregistrari...vezi "AzureTable Strategy.docx"
        }

        public EventEntry(string partitionKey, string rowKey)
        {
            base.PartitionKey = partitionKey;
            base.RowKey = rowKey;
        }

        //public Guid Id { get; set; }
        public string Code { get; set; } //ex: itcongress2012
        public string Title { get; set; }
        public string Description { get; set; }


    }
}

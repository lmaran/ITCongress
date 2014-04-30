using Web.Helpers;
using Web.Models;
using Web.ViewModels;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.WindowsAzure.Storage.Table;

namespace Web.Repositories
{
    public class WhiteListRepository : TableStorage<WhiteListEntry>, IWhiteListRepository
    {
        public WhiteListRepository()
            : base(tableName: "eta2u77WhiteList")
        {
        }


        public IEnumerable<string> GetAll(string eventId)
        {
            var filter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, eventId);
            var entitiesTable = this.ExecuteQuery(filter);
            return entitiesTable.Select(x => x.RowKey);
        }

        public int Get(string eventId, string email)
        {
            var entry = this.Retrieve(eventId, email);

            if (entry == null)
                //throw new HttpResponseException(HttpStatusCode.NotFound);
                return 0;
            else
                return 1;
        }

        public void Add(string eventId, string email)
        {
            var item = new WhiteListEntry();
            item.PartitionKey = eventId;
            item.RowKey = email;
            this.Insert(item);

        }

        public void Delete(string eventId, string email)
        {
            var item = new WhiteListEntry();
            item.PartitionKey = eventId;
            item.RowKey = email;
            this.Delete(item);

        }

    }

    public interface IWhiteListRepository : ITableStorage<WhiteListEntry>
    {
        IEnumerable<string> GetAll(string eventId);
        int Get(string eventId, string email);
        void Add(string eventId, string email);
        void Delete(string eventId, string email);
    }
}
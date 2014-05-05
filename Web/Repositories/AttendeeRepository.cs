using Web.Helpers;
using Web.Models;
using Web.ViewModels;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.WindowsAzure.Storage.Table;
using System.Dynamic;
using Newtonsoft.Json;

namespace Web.Repositories
{
    public class AttendeeRepository : TableStorage<DynamicTableEntity>, IAttendeeRepository
    {
        public AttendeeRepository()
            : base(tableName: "eta2u77Attendees")
        {
        }



        public IEnumerable<string> Get(string eventId, string email)
        {
            var entity = this.Retrieve(eventId, email);

            // if create entity if not exist
            if (entity == null)
            {
                entity = new DynamicTableEntity();

                entity.PartitionKey = eventId;
                entity.RowKey = email;
                entity.ETag = "*"; //neaparat

                entity.Properties.Add("RegisteredSessions", new EntityProperty("[]")); //empty list

                this.Insert(entity);
                return new List<string>(); //return empty list;
            }
            else
            {
                // Users should always assume property is not there in case another client removed it.
                EntityProperty registeredSessions;
                if (!entity.Properties.TryGetValue("RegisteredSessions", out registeredSessions))
                {
                    throw new ArgumentNullException("Invalid entity, RegisteredSessions property not found!");
                }
                //var xx = registeredSessions.StringValue;
                return JsonConvert.DeserializeObject<IEnumerable<string>>(registeredSessions.StringValue ?? string.Empty);

            }
        }

        public void Add(string eventId, string sessionId, string email)
        {
            var entity = this.Retrieve(eventId, email);

            // Users should always assume property is not there in case another client removed it.
            EntityProperty registeredSessions;
            if (!entity.Properties.TryGetValue("RegisteredSessions", out registeredSessions))
            {
                throw new ArgumentNullException("Invalid entity, RegisteredSessions property not found!");
            }

            var oldList =  JsonConvert.DeserializeObject<IEnumerable<string>>(registeredSessions.StringValue ?? string.Empty).ToList();
            oldList.Add(sessionId);
            var newList = JsonConvert.SerializeObject(oldList);

            entity.Properties["RegisteredSessions"] = new EntityProperty(newList); 

            entity.ETag = "*"; //neaparat
            var operation = TableOperation.Merge(entity);
            Table.Execute(operation);
        }

        public void Update(string eventId, string sessionId, string email)
        {
            var entity = this.Retrieve(eventId, email);

            // Users should always assume property is not there in case another client removed it.
            EntityProperty registeredSessions;
            if (!entity.Properties.TryGetValue("RegisteredSessions", out registeredSessions))
            {
                throw new ArgumentNullException("Invalid entity, RegisteredSessions property not found!");
            }

            var oldList = JsonConvert.DeserializeObject<IEnumerable<string>>(registeredSessions.StringValue ?? string.Empty).ToList();
            oldList.RemoveAll(x=>x.ToString()==sessionId);
            var newList = JsonConvert.SerializeObject(oldList);

            entity.Properties["RegisteredSessions"] = new EntityProperty(newList);

            entity.ETag = "*"; //neaparat
            var operation = TableOperation.Merge(entity);
            Table.Execute(operation);
        }

    }

    public interface IAttendeeRepository : ITableStorage<DynamicTableEntity>
    {
        //IEnumerable<string> GetAll(string eventId);
        IEnumerable<string> Get(string eventId, string email);
        void Add(string eventId, string sessionId, string email);
        void Update(string eventId, string sessionId, string email);
    }
}
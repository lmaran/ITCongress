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
    public class EventRepository : TableStorage<EventEntry>, IEventRepository
    {
        public EventRepository()
            : base(tableName: "eta2u77Events")
        {
        }


        public IEnumerable<EventViewModel> GetAll()
        {
            //AzureKeyValidator.ValidatePartitionKey(pk); //altfel da eroare daca string-ul este null, gol, >512ch sau are ch. speciale
            //var filter = TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, pk); //pt. inreg. care nu au PK

            var filter = "";
            //ok
            //var query = new TableQuery<EventEntry>().Where(filter);
            //var entitiesTable = Table.ExecuteQuery<EventEntry>(query);

            var entitiesTable = this.ExecuteQuery(filter);

            //ok, manual
            //var entityVM = new List<EventViewModel>();
            //foreach (var i in entities)
            //{
            //    entityVM.Add(new EventViewModel { Code = i.RowKey.Remove(0, i.RowKey.IndexOf('_') + 1), Title = i.Title, Description = i.Description });
            //}


            //automapper: copy "entitiesTable" to "entitiesVM"
            Mapper.CreateMap<EventEntry, EventViewModel>();
            var entitiesVM = Mapper.Map<List<EventEntry>, List<EventViewModel>>(entitiesTable.ToList()); //neaparat cu ToList()

            return entitiesVM;
        }


    }

    public interface IEventRepository : ITableStorage<EventEntry>
    {
        IEnumerable<EventViewModel> GetAll();
    }
}
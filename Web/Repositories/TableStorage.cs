using Web.Helpers;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace Web.Repositories
{
    public class TableStorage<T> : ITableStorage<T> where T : ITableEntity, new()
    {
        protected CloudTable Table;

        public TableStorage(string tableName, string connectionName = "Solution4AzureStorage")
        {
            var connString = ConfigurationManager.ConnectionStrings[connectionName].ConnectionString;
            var storageAccount = CloudStorageAccount.Parse(connString);
            var tableClient = storageAccount.CreateCloudTableClient();

            Table = tableClient.GetTableReference(tableName);
            Table.CreateIfNotExists();
        }

        /// <summary>
        /// Insert a new entity into table storage
        /// </summary>
        /// <param name="entity">The entity to insert</param>
        /// <returns>The ETag for the new entity</returns>
        public virtual string Insert(T entity)
        {
            var operation = TableOperation.Insert(entity);
            var result = Table.Execute(operation);
            return result.Etag;
        }

        public virtual IEnumerable<T> ExecuteQuery(string filter)      
        {
            var query = new TableQuery<T>().Where(filter);
            return Table.ExecuteQuery(query);
        }

        public T Retrieve(string pk, string rk)
        {
            AzureKeyValidator.ValidatePartitionKey(pk); //altfel da eroare daca string-ul este null, gol, >512ch sau are ch. speciale
            AzureKeyValidator.ValidateRowKey(rk);

            var operation = TableOperation.Retrieve<T>(pk, rk);
            var result = Table.Execute(operation);
            return (T)result.Result; // this will be null if it doesn't exist ...daca T este de tip Interfata, nu poti folosi la final constructia "as T"
        }

    }

    public interface ITableStorage<T>
    {
        string Insert(T entity);
        IEnumerable<T> ExecuteQuery(string filter);
        T Retrieve(string pk, string rk);
    }

}
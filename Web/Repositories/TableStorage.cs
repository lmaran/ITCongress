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

        public void InsertBatch(IEnumerable<T> objs)
        {
            List<List<T>> chunks = GetChunks(objs);

            foreach (var chunk in chunks)
            {
                var batchOperation = new TableBatchOperation();
                foreach (var obj in chunk)
                {
                    batchOperation.Insert(obj);
                }
                Table.ExecuteBatch(batchOperation);
            }
        }

        public void InsertOrMergeBatch(IEnumerable<T> objs)
        {
            List<List<T>> chunks = GetChunks(objs);

            foreach (var chunk in chunks)
            {
                var batchOperation = new TableBatchOperation();
                foreach (var obj in chunk)
                {
                    batchOperation.InsertOrMerge(obj);
                }
                Table.ExecuteBatch(batchOperation);
            }
        }

        public void InsertOrReplaceBatch(IEnumerable<T> objs)
        {
            List<List<T>> chunks = GetChunks(objs);

            foreach (var chunk in chunks)
            {
                var batchOperation = new TableBatchOperation();
                foreach (var obj in chunk)
                {
                    batchOperation.InsertOrReplace(obj);
                }
                Table.ExecuteBatch(batchOperation);
            }
        }

        public void MergeBatch(IEnumerable<T> objs)
        {
            List<List<T>> chunks = GetChunks(objs);

            foreach (var chunk in chunks)
            {
                var batchOperation = new TableBatchOperation();
                foreach (var obj in chunk)
                {
                    batchOperation.Merge(obj);
                }
                Table.ExecuteBatch(batchOperation);
            }
        }

        //Azure Table nu permite > 100 operatii intr-un batch
        private List<List<T>> GetChunks<T>(IEnumerable<T> objs)
        {
            var chunks = new List<List<T>>() { new List<T>() };
            foreach (var obj in objs)
            {
                if (chunks.Last().Count == 100)
                {
                    chunks.Add(new List<T>());
                }
                chunks.Last().Add(obj);
            }
            return chunks;
        }




        public virtual void Delete(T entity)
        {
            entity.ETag = "*"; 
            var operation = TableOperation.Delete(entity);
            Table.Execute(operation);
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
        void Delete(T entity);
    }

}
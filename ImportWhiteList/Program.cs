using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using System.Threading;

namespace ImportWhiteList
{
    class Program
    {
        // import a list of email that are approved by default
        static void Main(string[] args)
        {
            Console.WriteLine("Are you sure you want to continue? (y/n)");
            var ch = Console.ReadKey(true);
            if (ch.KeyChar == 'y' || ch.KeyChar == 'Y')
            {
                Console.WriteLine("Starting import data...");

                var connString = ConfigurationManager.AppSettings["Solution4AzureStorage"];
                var storageAccount = CloudStorageAccount.Parse(connString);
                var tableClient = storageAccount.CreateCloudTableClient();

                CloudTable table = tableClient.GetTableReference("eta2u77WhiteList");
                //table.DeleteIfExists();
                table.CreateIfNotExists();


                int counter = 0;
                string line;
                var list = new List<DynamicTableEntity>();

                // Read the file, line by line.
                System.IO.StreamReader file = new System.IO.StreamReader("c:\\WhiteList2014.txt");
                while ((line = file.ReadLine()) != null)
                {
                    var entity = new DynamicTableEntity();
                    entity.PartitionKey = "itcongress2014";
                    entity.RowKey = line.ToLower();
                    list.Add(entity);
                    counter++;
                }

                file.Close();
                SaveEntities(list,table);
                Console.WriteLine("{0} records have been imported!",counter);

            }
        }


        private static void SaveEntities<T>(IEnumerable<T> objs, CloudTable table) where T : ITableEntity
        {
            List<List<T>> chunks = GetChunks(objs);

            foreach (var chunk in chunks)
            {
                var batchOperation = new TableBatchOperation();
                foreach (var obj in chunk)
                {
                    batchOperation.Insert(obj);
                }
                table.ExecuteBatch(batchOperation);
            }
        }

        //Azure Table nu permite > 100 operatii intr-un batch
        private static List<List<T>> GetChunks<T>(IEnumerable<T> objs)
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

    }
}

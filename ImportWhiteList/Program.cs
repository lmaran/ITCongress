using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using System.Threading;
using Microsoft.WindowsAzure.Storage.Blob;

namespace ImportWhiteList
{
    class Program
    {
        // import a list of email that are approved by default
        static void Main(string[] args)
        {
            System.Console.WriteLine("Please select the option:");
            System.Console.WriteLine("1 - Import WhiteList");
            System.Console.WriteLine("2 - Upload cache property for all blobs in a specific container");
            System.Console.WriteLine("3 - Import LandinPage List");


            int option = int.Parse(System.Console.ReadLine());


            switch (option)
            {
                case 1:
                    ImportWhiteList();
                    break;
                case 2:
                    UpdateCachePropertyForAllBlobs();
                    break;
                case 3:
                    ImportLandingPageList();
                    break;
                default:
                    break;
            } 



        }

        private static void ImportWhiteList()
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
                table.CreateIfNotExists();


                int counter = 0;
                string line;
                var list = new List<DynamicTableEntity>();

                // Read the file, line by line.
                System.IO.StreamReader file = new System.IO.StreamReader("c:\\WhiteList2015.txt");
                while ((line = file.ReadLine()) != null)
                {
                    var entity = new DynamicTableEntity();
                    entity.PartitionKey = "itcongress2015";
                    entity.RowKey = line.ToLower();
                    list.Add(entity);
                    counter++;
                }

                file.Close();
                // uncomment the lines below if you want to import data
                //SaveEntities(list, table);
                //Console.WriteLine("{0} records have been imported!", counter);
            }
        }

        private static void ImportLandingPageList()
        {
            Console.WriteLine("Are you sure you want to continue? (y/n)");
            var ch = Console.ReadKey(true);
            if (ch.KeyChar == 'y' || ch.KeyChar == 'Y')
            {
                Console.WriteLine("Starting import data...");

                var connString = ConfigurationManager.AppSettings["Solution4AzureStorage"];
                var storageAccount = CloudStorageAccount.Parse(connString);
                var tableClient = storageAccount.CreateCloudTableClient();

                CloudTable table = tableClient.GetTableReference("eta2u77UserDetails");
                table.CreateIfNotExists();


                int counter = 0;
                string line;
                var list = new List<DynamicTableEntity>();

                // Read the file, line by line.
                System.IO.StreamReader file = new System.IO.StreamReader("c:\\Data\\LandingPage2015.csv");
                while ((line = file.ReadLine()) != null)
                {
                    var values = line.Split(',');
                    var entity = new DynamicTableEntity();
                    entity.PartitionKey = "itcongress2015";
                    entity.RowKey = values[0].ToLower(); //email
                    entity.Properties.Add("FirstName", new EntityProperty(values[1]));
                    entity.Properties.Add("LastName", new EntityProperty(values[2]));                 
                    entity.Properties.Add("Company", new EntityProperty(values[3]));
                    entity.Properties.Add("Title", new EntityProperty(values[4]));
                    entity.Properties.Add("Phone", new EntityProperty(values[5]));
                    entity.Properties.Add("Owner", new EntityProperty(values[6]));
                    
                    list.Add(entity);
                    counter++;
                }

                file.Close();
                // uncomment the lines below if you want to import data
                SaveEntities(list, table);
                Console.WriteLine("{0} records have been imported!", counter);
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
                Console.WriteLine("100...");
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


        // http://code.msdn.microsoft.com/windowsazure/How-To-Use-Azure-Blob-16882fe2/sourcecode?fileId=79174&pathId=472125784
        private static void UpdateCachePropertyForAllBlobs()
        {
            var connString = ConfigurationManager.AppSettings["Solution4AzureStorage"];
            var storageAccount = CloudStorageAccount.Parse(connString);
            var blobClient = storageAccount.CreateCloudBlobClient();

            CloudBlobContainer container = blobClient.GetContainerReference("itcongress2015"); 
            //container.CreateIfNotExists();

            try
            {
                // Loop over items within the container and output the length and URI. 
                foreach (IListBlobItem item in container.ListBlobs(null, false))
                {
                    if (item.GetType() == typeof(CloudBlockBlob))
                    {
                        CloudBlockBlob blob = (CloudBlockBlob)item;

                        // uncomment the below lines to update blob property
                        blob.Properties.CacheControl = "public, max-age=86400"; // 24h; max-age=86400, must revalidate
                        blob.SetProperties();

                        Console.WriteLine("The result:");
                        Console.WriteLine("Block blob name: {0}, Cache : {1}", blob.Name, blob.Properties.CacheControl);

                    }

                    // not necessary:

                    //else if (item.GetType() == typeof(CloudPageBlob))
                    //{
                    //    CloudPageBlob pageBlob = (CloudPageBlob)item;

                    //    Console.WriteLine("Page blob of length {0}: {1}", pageBlob.Properties.Length, pageBlob.Uri);

                    //}
                    //else if (item.GetType() == typeof(CloudBlobDirectory))
                    //{
                    //    CloudBlobDirectory directory = (CloudBlobDirectory)item;

                    //    Console.WriteLine("Directory: {0}", directory.Uri);
                    //}
                }
            }
            catch
            {
                throw;
            }
        } 
    }
}

namespace Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Id2 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "Id2", c => c.Long(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.AspNetUsers", "Id2");
        }
    }
}

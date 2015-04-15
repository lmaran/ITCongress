namespace Web.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class AddOwner : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "Owner", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.AspNetUsers", "Owner");
        }
    }
}

using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace ERP_DAO.JobInwardTransaction
{
    public class JobworkSOPendingRegister_DAO
    {
        DBConnect DB = new DBConnect();
        public DataSet JobworkSOPendingRegisterDB(JobworkSOPendingRegister_Filter_DTO filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_JobworkSOPendingRegister_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date,
                (object)filter.FromDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToDate", DbType.Date,
                (object)filter.ToDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@SO_No", DbType.String,
                (object)filter.SO_No ?? DBNull.Value);
            db.AddInParameter(cmd, "@JW_Customer_Number", DbType.Int64,
                (object)filter.JW_Customer_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@PRS_Number", DbType.Int64,
                (object)filter.PRS_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@ItemGroup_Number", DbType.Int64,
                (object)filter.ItemGroup_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@Item_Number", DbType.Int64,
                (object)filter.Item_Number ?? DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }
    }
}
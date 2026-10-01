using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;
using System.Data.Common;

namespace ERP_DAO.JobInwardTransaction
{
    public class FreightSOPendingRegister_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet FreightSOPendingDNRegisterDB(FreightSOPendingRegister_Filter_DTO filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_FreightSOPendingDNRegister_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date, (object)filter.FromDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToDate", DbType.Date, (object)filter.ToDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@SO_No", DbType.String, (object)filter.SO_No ?? DBNull.Value);
            db.AddInParameter(cmd, "@JW_Customer_Number", DbType.Int64, (object)filter.JW_Customer_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@PRS_Number", DbType.Int64, (object)filter.PRS_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64, (object)filter.FromWH_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64, (object)filter.ToWH_Number ?? DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }

        public DataSet FreightSOPendingRNRegisterDB(FreightSOPendingRegister_Filter_DTO filter)
        {
            Database db = new SqlDatabase(DB.Connection());
            DbCommand cmd = db.GetStoredProcCommand("JI_FreightSOPendingRNRegister_SP");

            db.AddInParameter(cmd, "@FromDate", DbType.Date, (object)filter.FromDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToDate", DbType.Date, (object)filter.ToDate ?? DBNull.Value);
            db.AddInParameter(cmd, "@SO_No", DbType.String, (object)filter.SO_No ?? DBNull.Value);
            db.AddInParameter(cmd, "@JW_Customer_Number", DbType.Int64, (object)filter.JW_Customer_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@PRS_Number", DbType.Int64, (object)filter.PRS_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@FromWH_Number", DbType.Int64, (object)filter.FromWH_Number ?? DBNull.Value);
            db.AddInParameter(cmd, "@ToWH_Number", DbType.Int64, (object)filter.ToWH_Number ?? DBNull.Value);

            return db.ExecuteDataSet(cmd);
        }
    }
}
using System;
using System.Data;
using System.Data.Common;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using ERP_DTO.JobOutwardTransaction;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JOFTI_DFS_DAO
    {
        DBConnect DB = new DBConnect();

        public DataSet JO_FreightInvoiceDFSDB(JO_FreightInvoiceDFS_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOFTI_DFS_Save");

            Db.AddInParameter(DbC, "@JOFTI_DFS_Category", DbType.String, DTO.JOFTI_DFS_Category);
            Db.AddInParameter(DbC, "@JOFTI_DFS_JW_Vendor_Number", DbType.Int64, DTO.JOFTI_DFS_JW_Vendor_Number);
            Db.AddInParameter(DbC, "@JOFTI_DFS_PaymentTerms", DbType.String, DTO.JOFTI_DFS_PaymentTerms);
            Db.AddInParameter(DbC, "@JOFTI_DFS_PaymentMethod", DbType.String, DTO.JOFTI_DFS_PaymentMethod);
            Db.AddInParameter(DbC, "@JOFTI_DFS_Remarks", DbType.String, DTO.JOFTI_DFS_Remarks);

            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DataSet DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));
            return DS;
        }

        public DataSet JO_FreightInvoiceDFSGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JOFTI_DFS_Get");
            return Db.ExecuteDataSet(DbC);
        }
    }
}

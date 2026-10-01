using ERP_DTO.JobOutwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobOutwardTransaction
{
    public class JW_VendorCategory_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JW_VendorCategoryDB(JW_VendorCategory_DTO JVC_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JW_VendorCategory_SP");

            Int64 Under = Int64.TryParse(JVC_DTO.JVC_Under_JVC_Number, out Int64 U) ? U : 0;

            Db.AddInParameter(DbC, "@JVC_Number", DbType.Int64, JVC_DTO.JVC_Number);
            Db.AddInParameter(DbC, "@JVC_JW_VendorCategory", DbType.String, JVC_DTO.JVC_JW_VendorCategory);
            Db.AddInParameter(DbC, "@JVC_Description", DbType.String, JVC_DTO.JVC_Description);
            Db.AddInParameter(DbC, "@JVC_Under_JVC_Number", DbType.Int64, Under);
            Db.AddInParameter(DbC, "@JVC_DeleteNumbers", DbType.String, JVC_DTO.JVC_DeleteNumbers);
            Db.AddInParameter(DbC, "@JVC_CreatorCode", DbType.Int64, JVC_DTO.JVC_CreatorCode);
            Db.AddInParameter(DbC, "@JVC_Id", DbType.Int32, JVC_DTO.JVC_Id);

            DS = Db.ExecuteDataSet(DbC);

            return DS;
        }
    }
}

// ============================================================
// TRADLINKZ — SUPABASE DATA LAYER (PATH B)
// ============================================================

// PASTE YOUR SUPABASE URL AND PUBLISHABLE KEY HERE
const SUPABASE_URL = 'https://rmbqppdhubyufvhkbizl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jg4u3uuEGihuMYiJxz1nDA_bmjeecrd';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- READ ----------
async function getCategories() {
    const { data, error } = await supabaseClient.from('categories').select('*').order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data;
}

async function getProducts() {
    const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data;
}

async function getProductsByCategory(categoryId) {
    const { data, error } = await supabaseClient.from('products').select('*').eq('category_id', categoryId);
    if (error) { console.error(error); return []; }
    return data;
}

// ---------- WRITE (Categories) ----------
async function addCategory(name) {
    const { data, error } = await supabaseClient.from('categories').insert([{ name: name }]).select();
    if (error) { return { ok: false, message: error.message }; }
    return { ok: true, category: data[0] };
}

// ---------- WRITE (Products) ----------
async function addProduct(productData) {
    let imageUrl = null;
    
    if (productData.imageFile) {
        const fileExt = productData.imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('product-images')
            .upload(fileName, productData.imageFile);

        if (uploadError) {
            return { ok: false, message: 'Image upload failed: ' + uploadError.message };
        }

        const { data: urlData } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(fileName);
            
        imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabaseClient.from('products').insert([{
        name: productData.name,
        price: productData.price,
        category_id: productData.categoryId,
        image: imageUrl,
        description: productData.description,
        stock: productData.stock
    }]).select();

    if (error) { return { ok: false, message: error.message }; }
    return { ok: true, product: data[0] };
}

async function deleteProduct(productId) {
    const { error } = await supabaseClient.from('products').delete().eq('id', productId);
    if (error) console.error(error);
}

// ---------- AUTHENTICATION (Admin) ----------
async function adminLogin(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, user: data.user };
}

async function adminLogout() {
    await supabaseClient.auth.signOut();
}

async function getCurrentAdmin() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session ? session.user : null;
}